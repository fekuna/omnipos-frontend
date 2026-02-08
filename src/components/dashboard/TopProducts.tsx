import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopProductsProps {
  data: { name: string; sales: number; revenue: string }[];
}

export function TopProducts({ data }: TopProductsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best selling items this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {data.map((product, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{product.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sales} sales</p>
              </div>
              <div className="ml-auto font-medium">{product.revenue}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
