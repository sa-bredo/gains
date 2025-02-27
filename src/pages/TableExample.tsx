
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

// Mock task data
const initialTasks = [
  { id: '1', title: 'Design landing page', status: 'Todo', priority: 'High' },
  { id: '2', title: 'Fix bugs in API', status: 'In Progress', priority: 'Medium' },
  { id: '3', title: 'Write docs', status: 'Done', priority: 'Low' },
];

export default function TableExample() {
  const [tasks, setTasks] = useState(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'Todo', priority: 'Medium' });

  const addTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, { ...newTask, id: Date.now().toString() }]);
      setNewTask({ title: '', status: 'Todo', priority: 'Medium' });
      setIsDialogOpen(false);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

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
              <span className="font-medium">Task Management</span>
            </div>
          </motion.header>
          
          <motion.div 
            className="p-6"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tasks</h2>
              <Button onClick={() => setIsDialogOpen(true)}>
                New Task
              </Button>
            </div>

            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          task.status === 'Todo' ? 'bg-blue-100 text-blue-800' : 
                          task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="h-8 w-8 p-0"
                        >
                          ✕
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title">Title</label>
                    <Input
                      id="title"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="status">Status</label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todo">Todo</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="priority">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addTask}>
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
