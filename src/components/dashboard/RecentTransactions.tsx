import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentTransactionsProps {
  data: { customer: string; amount: string; status: string; date: string }[];
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest orders from your store</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((tx, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{tx.customer}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tx.status === "Completed" ? "default" : tx.status === "Processing" ? "secondary" : "destructive"}>
                  {tx.status}
                </Badge>
                <span className="text-sm font-bold">{tx.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
