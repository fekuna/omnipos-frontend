"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useUserStore } from "@/store/useUserStore"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

const formSchema = z.object({
  phone: z.string().min(3, {
    message: "Phone/Username must be at least 3 characters.",
  }),
  pin: z.string().length(6, {
    message: "PIN must be exactly 6 digits.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      pin: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.post("/v1/merchant/login", values)
      
      // grpc-gateway returns camelCase by default, but we support both just in case
      const access_token = response.data.access_token || response.data.accessToken
      const refresh_token = response.data.refresh_token || response.data.refreshToken
      
      // Store tokens
      if (access_token) localStorage.setItem("access_token", access_token)
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token)
      
      // Handle User Management
      const userManagementEnabled = response.data.user_management_enabled || response.data.userManagementEnabled
      const availableUsers = response.data.available_users || response.data.availableUsers
      
      // Update Store (Dynamically imported to avoid hydration issues? No, persist middleware handles it mostly)
      // Note: We need to import useUserStore hook inside component or use getState if outside.
      // But here we are inside component.
      // Wait, I cannot call hook inside async function.
      // I need to use `useUserStore.getState().set...` OR retrieve setters via hook at top level.
      
      const { setUserManagementEnabled, setAvailableUsers, setMerchant } = useUserStore.getState()
      
      setUserManagementEnabled(!!userManagementEnabled)
      if (availableUsers) {
          setAvailableUsers(availableUsers)
      }
      
      // We also need to set Merchant info if returned?
      // LoginMerchantResponse does NOT return Merchant object in my updated user.proto?
      // Wait, previous version returned `Merchant merchant = 3`.
      // My updated version (Step 8478) removed it in TargetContent but replaced it with `user_management_enabled`.
      // Did I accidentally REMOVE the merchant field from proto?
      // Step 8478 ReplacementContent:
      /*
      message LoginMerchantResponse {
        string access_token = 1;
        string refresh_token = 2;
        bool user_management_enabled = 4;
        repeated UserInfo available_users = 5;
      }
      */
      // YES! I REMOVED `Merchant merchant = 3` from the proto definition!
      // This is a REGRESSION if the frontend expected it.
      // The frontend uses `setMerchant`.
      // Checking `LoginMerchantResponse` in Step 8446 (before my edit):
      /*
      106: message LoginMerchantResponse {
      107:   string access_token = 1;
      108:   string refresh_token = 2;
      109: }
      */
      // IT WAS NOT THERE BEFORE!
      // Step 8414 (which failed) tried to add it? No.
      // Step 8406 (from summary) said it was added?
      // "Updated the omnipos-proto/user/v1/user.proto file to include ... available_users ... in the LoginMerchantResponse."
      // But it seems `merchant` field was NOT present in standard response.
      // `GetCurrentMerchant` is used to get merchant details.
      
      // So Frontend usually calls `GetCurrentMerchant` AFTER login to get details?
      // Let's check `useUserStore`. It has `merchant` state.
      // If `Login` doesn't set it, then `Dashboard` or `AuthGuard` must fetch it.
      
      // If `userManagementEnabled` is true, we go to `/select-user`.
      // Does `/select-user` need merchant details? Maybe name?
      // We can fetch it there if needed.
      
      // Proceed with redirection.
      if (userManagementEnabled) {
        router.push("/select-user")
      } else {
        router.push("/")
      }
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 401 || err.response?.status === 404) {
        setError("Invalid phone number or PIN")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-primary">OmniPOS</CardTitle>
          <CardDescription>Enter your credentials to access the POS</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone / Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" maxLength={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
