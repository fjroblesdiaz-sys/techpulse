"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPlans } from "@/lib/data";
import { Check, Zap, Crown, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("team");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan) return;
    
    setProcessing(selectedPlan);
    
    setTimeout(() => {
      setCurrentPlan(selectedPlan);
      setProcessing(null);
      setShowPaymentModal(false);
      setSelectedPlan(null);
    }, 1500);
  };

  const handleCancelSubscription = () => {
    if (confirm("Are you sure you want to cancel your subscription? You will lose access to premium features.")) {
      setCurrentPlan("starter");
    }
  };

  const getCurrentPlanDetails = () => {
    const plan = mockPlans.find(p => p.id === currentPlan);
    return plan || mockPlans[0];
  };

  const current = getCurrentPlanDetails();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400">Manage your subscription</p>
      </div>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the {current.name} plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{current.name} Plan</p>
                <p className="text-sm text-slate-400">
                  {current.id === "starter" && "3 developers • 7-day data retention"}
                  {current.id === "team" && "Unlimited developers • 30-day data retention"}
                  {current.id === "business" && "Unlimited developers • 90-day data retention"}
                  {current.id === "enterprise" && "Unlimited everything"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {current.price === 0 ? "Free" : `$${current.price}`}
                  {current.price && <span className="text-sm text-slate-400">/mo</span>}
                </p>
                {current.price === 0 && <p className="text-sm text-slate-400">forever</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockPlans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "bg-slate-800/30 border-slate-700/50 relative overflow-hidden",
              plan.id === currentPlan && "border-indigo-500/50"
            )}
          >
            {plan.id === currentPlan && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                Current
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                {plan.id === "starter" && <Zap className="w-5 h-5 text-slate-400" />}
                {plan.id === "team" && <Crown className="w-5 h-5 text-amber-400" />}
                {plan.id === "business" && <Building2 className="w-5 h-5 text-indigo-400" />}
                {plan.id === "enterprise" && <Building2 className="w-5 h-5 text-purple-400" />}
                <CardTitle>{plan.name}</CardTitle>
              </div>
              <div className="pt-2">
                <span className="text-4xl font-bold text-white">${plan.price ?? 0}</span>
                {(plan.price ?? 0) > 0 && <span className="text-slate-400">/month</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6"
                variant={plan.id === currentPlan ? "outline" : "default"}
                disabled={plan.id === currentPlan || processing}
                onClick={() => handleUpgrade(plan.id)}
              >
                {processing === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : plan.id === currentPlan ? (
                  "Current Plan"
                ) : plan.price === 0 ? (
                  "Downgrade"
                ) : (
                  "Upgrade"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan === "starter" ? (
            <div className="text-center py-8 text-slate-400">
              <p>No billing history yet</p>
              <p className="text-sm mt-1">Upgrade to a paid plan to see your billing history</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20">
                <div>
                  <p className="text-sm font-medium text-slate-200">Team Plan - Monthly</p>
                  <p className="text-xs text-slate-400">Feb 1, 2026</p>
                </div>
                <span className="text-emerald-400 text-sm">Paid</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20">
                <div>
                  <p className="text-sm font-medium text-slate-200">Team Plan - Monthly</p>
                  <p className="text-xs text-slate-400">Jan 1, 2026</p>
                </div>
                <span className="text-emerald-400 text-sm">Paid</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium text-slate-200">•••• •••• •••• 4242</p>
                <p className="text-sm text-slate-400">Expires 12/26</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </CardContent>
      </Card>

      {currentPlan !== "starter" && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Cancel Subscription</p>
                <p className="text-xs text-slate-400">You will lose access to premium features</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleCancelSubscription}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Upgrade</h3>
            <p className="text-slate-400 mb-6">
              You are about to upgrade to the {mockPlans.find(p => p.id === selectedPlan)?.name} plan.
              {selectedPlan === "team" && " You will be charged $15 per developer per month."}
              {selectedPlan === "business" && " You will be charged $35 per developer per month."}
              {selectedPlan === "enterprise" && " Contact us for custom pricing."}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConfirmPayment}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
