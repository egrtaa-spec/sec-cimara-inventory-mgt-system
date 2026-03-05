"use client";

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WarehouseInventoryForm } from "@/app/admin/dashboard/warehouse-inventory-form"
import { AdminEngineerForm } from "@/app/admin/dashboard/admin-engineer-form"
import { WarehouseWithdrawalForm } from "@/app/admin/dashboard/warehouse-withdrawal-form"
import { WarehouseStockSummaryReport } from "@/app/admin/dashboard/warehouse-stock-summary"
import { WarehouseWithdrawalHistoryReport } from "@/app/admin/dashboard/warehouse-withdrawal-history"

export function WarehouseOperationsView() {
    const [refreshKey, setRefreshKey] = useState(0);
    const handleRefresh = () => setRefreshKey(prev => prev + 1);

    return (
        <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="inventory">Enter Warehouse Inventory</TabsTrigger>
                <TabsTrigger value="engineers">Register Engineers</TabsTrigger>
                <TabsTrigger value="withdrawals">Record Warehouse Withdrawals</TabsTrigger>
                <TabsTrigger value="report">Stock Report</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Equipment to Warehouse</CardTitle>
                        <CardDescription>Fill in the details for new materials or equipment.</CardDescription>
                    </CardHeader>
                    <CardContent><WarehouseInventoryForm onSuccess={handleRefresh} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="engineers">
                <Card>
                    <CardHeader>
                        <CardTitle>Register a New Engineer</CardTitle>
                        <CardDescription>Create an account for a site engineer.</CardDescription>
                    </CardHeader>
                    <CardContent><AdminEngineerForm onSuccess={handleRefresh} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="withdrawals">
                 <Card>
                    <CardHeader>
                        <CardTitle>Record a Withdrawal from the Warehouse</CardTitle>
                        <CardDescription>This is for transferring equipment from the main warehouse to a site or person.</CardDescription>
                    </CardHeader>
                    <CardContent><WarehouseWithdrawalForm key={`withdrawal-form-${refreshKey}`} onSuccess={handleRefresh} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="report">
                 <Card>
                     <CardHeader>
                        <CardTitle>Warehouse Stock Report</CardTitle>
                        <CardDescription>A summary of stock levels and withdrawal history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="summary">Stock Summary</TabsTrigger>
                                <TabsTrigger value="history">Withdrawal History</TabsTrigger>
                            </TabsList>
                            <TabsContent value="summary"><Card><CardContent className="pt-6"><WarehouseStockSummaryReport key={`summary-${refreshKey}`} /></CardContent></Card></TabsContent>
                            <TabsContent value="history"><Card><CardContent className="pt-6"><WarehouseWithdrawalHistoryReport key={`history-${refreshKey}`} /></CardContent></Card></TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
