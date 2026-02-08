"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/useUserStore"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Users, Store, ArrowLeft, Loader2, AlertCircle } from "lucide-react"

export default function SelectUserPage() {
  const router = useRouter()
  const { availableUsers, userManagementEnabled, merchant, logout } = useUserStore()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Protect route
  useEffect(() => {
    // If not enabled or no users (and checking persisting state), might redirect.
    // Ideally we check if we have a valid merchant token?
    // api interceptor might handle 401.
    if (!userManagementEnabled) {
      router.push("/")
    }
  }, [userManagementEnabled, router])

  const handleOwnerLogin = () => {
    // Already logged in as merchant (owner)
    // Just redirect to dashboard
    router.push("/")
  }

  const handleUserClick = (user: any) => {
    setSelectedUser(user)
    setPassword("")
    setError(null)
  }

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setIsLoading(true)
    setError(null)

    try {
      // Get merchant_id from token or store?
      // We don't have merchant_id in store if we didn't fetch it.
      // But we have the token.
      // The API endpoint /v1/users/login requires merchant_id.
      // We can decode the token to get merchant_id? 
      // Or we should have stored it. 
      // LoginMerchantResponse did not return it. 
      // BUT `GetCurrentMerchant` does.
      // Maybe we should have called `GetCurrentMerchant` in `login/page.tsx`?
      // Or we can try to call it now?
      // OR, we can just use the token we have.
      // Wait, `LoginUserRequest` : message LoginUserRequest { string merchant_id = 1; ... }
      // It is REQUIRED.
      
      // Attempt to get merchant ID from store or fetch it.
      let merchantId = merchant?.id
      if (!merchantId) {
          // Try to fetch current merchant to get ID
          try {
             const merchRes = await api.get("/v1/merchant/current")
             merchantId = merchRes.data.id
             useUserStore.getState().setMerchant(merchRes.data)
          } catch (e) {
             throw new Error("Failed to get merchant context")
          }
      }

      const response = await api.post("/v1/users/login", {
        merchant_id: merchantId,
        username: selectedUser.username,
        password: password,
      })

      const { access_token, refresh_token, user } = response.data

      // Overwrite tokens with User tokens
      if (access_token) localStorage.setItem("access_token", access_token)
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token)
      
      // Update store
      useUserStore.getState().setUser(user)
      
      // Redirect
      router.push("/")
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Invalid password")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleBackToLogin = () => {
      logout()
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
           <h1 className="text-3xl font-bold text-primary">Who is using the POS?</h1>
           <p className="text-gray-500">Select your profile to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Owner Card */}
           <Card 
             className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 hover:border-primary bg-white"
             onClick={handleOwnerLogin}
           >
             <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
               <div className="p-4 bg-primary/10 rounded-full">
                 <Store className="h-10 w-10 text-primary" />
               </div>
               <div className="text-center">
                 <h3 className="font-bold text-lg">Store Owner</h3>
                 <p className="text-sm text-gray-500">Admin Access</p>
               </div>
             </CardContent>
           </Card>

           {/* User Cards */}
           {availableUsers.map((user) => (
             <Card 
               key={user.id} 
               className="cursor-pointer hover:shadow-lg transition-shadow bg-white"
               onClick={() => handleUserClick(user)}
             >
               <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                 <div className="p-4 bg-gray-100 rounded-full">
                   <Users className="h-10 w-10 text-gray-600" />
                 </div>
                 <div className="text-center">
                   <h3 className="font-bold text-lg">{user.full_name}</h3>
                   <p className="text-sm text-gray-500">{user.role_name}</p>
                 </div>
               </CardContent>
             </Card>
           ))}
        </div>
        
        <div className="flex justify-center mt-8">
            <Button variant="ghost" onClick={handleBackToLogin} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
            </Button>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hello, {selectedUser?.full_name}</DialogTitle>
            <DialogDescription>
              Enter your password to access the system.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUserLogin} className="space-y-4 py-4">
             {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
             )}
             
             <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                   id="password" 
                   type="password" 
                   value={password} 
                   onChange={(e) => setPassword(e.target.value)} 
                   placeholder="Enter your password"
                   autoFocus
                />
             </div>
             
             <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setSelectedUser(null)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
