"use client";

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WarehouseInventoryForm } from "@/app/admin/dashboard/warehouse-inventory-form"
import { AdminEngineerForm } from "@/app/admin/dashboard/admin-engineer-form"
import { WarehouseWithdrawalForm } from "@/app/admin/dashboard/warehouse-withdrawal-form"
import { WarehouseStockSummaryReport } from "@/app/admin/dashboard/warehouse-stock-summary"
import { WarehouseWithdrawalHistoryReport } from "@/app/admin/dashboard/warehouse-withdrawal-history"

export function WarehouseOperationsView({ onOperationSuccess }: { onOperationSuccess?: () => void }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        if (onOperationSuccess) onOperationSuccess();
    };

    return (
        <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="inventory">Enter Warehouse Inventory</TabsTrigger>
                <TabsTrigger value="engineers">Register Engineers</TabsTrigger>
                <TabsTrigger value="withdrawals">Record Warehouse Withdrawals</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Equipment to Warehouse</CardTitle>
                        <CardDescription>Fill in the details for new materials or equipment.</CardDescription>
                    </CardHeader>
                    <CardContent><WarehouseInventoryForm key={`inventory-form-${refreshKey}`} onSuccess={handleRefresh} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="engineers">
                <Card>
                    <CardHeader>
                        <CardTitle>Register a New Engineer</CardTitle>
                        <CardDescription>Create an account for a site engineer.</CardDescription>
                    </CardHeader>
                    <CardContent><AdminEngineerForm key={`engineer-form-${refreshKey}`} onSuccess={handleRefresh} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="withdrawals">
                 <Card>
                    <CardHeader>
                        <CardTitle>Record a Withdrawal from the Warehouse</CardTitle>
                        <CardDescription>This is for transferring equipment from the main warehouse to a site or person.</CardDescription>
                    </CardHeader>
                    <CardContent><WarehouseWithdrawalForm key={`withdrawal-form-${refreshKey}`} onSuccess={handleRefresh} /></CardContent>
                    <CardContent className="overflow-y-auto max-h-[calc(100vh-240px)]"><WarehouseWithdrawalForm key={`withdrawal-form-${refreshKey}`} onSuccess={handleRefresh} /></CardContent>
                </Card>
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Recent Warehouse Withdrawals</CardTitle>
                        <CardDescription>History of the last recorded withdrawals from the main warehouse.</CardDescription>
                    </CardHeader>
                    <CardContent><WarehouseWithdrawalHistoryReport refreshTrigger={refreshKey} /></CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
