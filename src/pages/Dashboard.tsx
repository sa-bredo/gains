
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Activity, ActivitySquare, Eye, ScrollText, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <motion.header 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out"
          >
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Anatomy Dashboard</span>
            </div>
          </motion.header>
          
          <motion.div 
            className="p-6"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="grid gap-6">
              <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="systems">Body Systems</TabsTrigger>
                    <TabsTrigger value="regions">Regions</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: "Models", description: "Interactive 3D anatomy models", icon: <Eye className="h-5 w-5" />, value: "24" },
                      { title: "Learning Paths", description: "Structured learning journeys", icon: <ScrollText className="h-5 w-5" />, value: "8" },
                      { title: "Recent Views", description: "Recently explored content", icon: <ActivitySquare className="h-5 w-5" />, value: "12" },
                    ].map((item, i) => (
                      <Card key={i} className="overflow-hidden border-border/50">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle>{item.title}</CardTitle>
                            <div className="bg-primary/10 p-2 rounded-full">
                              {item.icon}
                            </div>
                          </div>
                          <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{item.value}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-border/50">
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your learning progress overview</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { title: "Cardiac Anatomy", date: "2 hours ago", progress: 65 },
                            { title: "Nervous System", date: "Yesterday", progress: 40 },
                            { title: "Digestive Tract", date: "3 days ago", progress: 90 },
                          ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <ActivitySquare className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{activity.title}</div>
                                <div className="text-sm text-muted-foreground">{activity.date}</div>
                                <div className="w-full bg-muted/50 rounded-full h-2 mt-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${activity.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Study Groups</CardTitle>
                        <CardDescription>Connected learners</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { name: "Medical Students", members: 124 },
                            { name: "Physiotherapists", members: 56 },
                            { name: "Researchers", members: 38 },
                          ].map((group, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{group.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {group.members} members
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="systems" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { title: "Nervous System", icon: <Brain className="h-8 w-8" />, count: "42 models" },
                      { title: "Cardiovascular", icon: <Heart className="h-8 w-8" />, count: "28 models" },
                      { title: "Respiratory", icon: <Activity className="h-8 w-8" />, count: "18 models" },
                      { title: "Digestive", icon: <ActivitySquare className="h-8 w-8" />, count: "24 models" },
                      { title: "Musculoskeletal", icon: <ActivitySquare className="h-8 w-8" />, count: "36 models" },
                      { title: "Urinary", icon: <ActivitySquare className="h-8 w-8" />, count: "14 models" },
                    ].map((system, i) => (
                      <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow border-border/50">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle>{system.title}</CardTitle>
                            <div className="bg-primary/10 p-2 rounded-full">
                              {system.icon}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">{system.count}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="regions" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { title: "Head & Neck", count: "32 models" },
                      { title: "Thorax", count: "24 models" },
                      { title: "Abdomen", count: "28 models" },
                      { title: "Upper Limb", count: "18 models" },
                      { title: "Lower Limb", count: "18 models" },
                      { title: "Back", count: "14 models" },
                    ].map((region, i) => (
                      <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow border-border/50">
                        <CardHeader>
                          <CardTitle>{region.title}</CardTitle>
                          <CardDescription>{region.count}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
