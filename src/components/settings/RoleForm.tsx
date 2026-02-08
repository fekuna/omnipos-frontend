"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Permission } from "@/lib/types"

const roleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  permission_ids: z.array(z.string()).min(1, "Select at least one permission"),
})

interface RoleFormProps {
  defaultValues?: z.infer<typeof roleSchema>
  onSubmit: (data: z.infer<typeof roleSchema>) => Promise<void>
  permissions: Permission[]
  isLoading?: boolean
}

export function RoleForm({ defaultValues, onSubmit, permissions, isLoading }: RoleFormProps) {
  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      permission_ids: [],
    },
  })

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = []
    acc[perm.module].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Cashier" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the role..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permission_ids"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Permissions</FormLabel>
                <FormDescription>
                  Select the permissions needed for this role.
                </FormDescription>
              </div>
              
              <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <Card key={module}>
                        <CardContent className="p-4">
                            <h4 className="mb-3 font-medium capitalize border-b pb-2">{module.replace('_', ' ')}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {perms.map((perm) => (
                                    <FormField
                                        key={perm.id}
                                        control={form.control}
                                        name="permission_ids"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={perm.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(perm.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, perm.id])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== perm.id
                                                                        )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel className="text-sm font-normal">
                                                            {perm.name}
                                                        </FormLabel>
                                                        <FormDescription className="text-xs">
                                                            {perm.description}
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )
                                        }}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Role
        </Button>
      </form>
    </Form>
  )
}
