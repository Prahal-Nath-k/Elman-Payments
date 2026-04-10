import { LayoutDashboard } from "lucide-react";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to ElmanPay. Here is a high-level overview of company payments.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
         <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between pb-2 space-y-0">
               <h3 className="tracking-tight text-sm font-medium">Total Outstanding</h3>
               <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
               <div className="text-2xl font-bold">₹45,231.89</div>
               <p className="text-xs text-muted-foreground">+20% from last month</p>
            </div>
         </div>
      </div>
    </div>
  )
}
