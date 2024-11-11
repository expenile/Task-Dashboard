'use client'

import { useEffect, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createStore } from 'redux'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { Bell, Calendar, ChevronDown, Filter, Home, Link2, MessageSquare, MoreVertical, Plus, Search, Settings, Smile, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Redux setup
const initialState = JSON.parse(localStorage.getItem('taskState')) || {
  tasks: {
    todo: [
      {
        id: '1',
        title: 'Brainstorming',
        description: 'Brainstorming brings team members\' diverse experience into play.',
        priority: 'low',
        comments: 12,
        files: 0,
        assignees: ['user1', 'user2', 'user3']
      },
      {
        id: '2',
        title: 'Research',
        description: 'User research helps you to create an optimal product for users.',
        priority: 'high',
        comments: 10,
        files: 3,
        assignees: ['user1', 'user2']
      },
      {
        id: '3',
        title: 'Wireframes',
        description: 'Low fidelity wireframes include the most basic content and visuals.',
        priority: 'high',
        comments: 8,
        files: 2,
        assignees: ['user1', 'user2', 'user3']
      }
    ],
    inProgress: [
      {
        id: '4',
        title: 'Brainstorming',
        description: 'Brainstorming brings team members\' diverse experience into play.',
        priority: 'low',
        comments: 12,
        files: 0,
        assignees: ['user1', 'user2', 'user3']
      }
    ],
    done: [
      {
        id: '5',
        title: 'Design System',
        description: 'It just needs to adapt the UI from what you did before',
        priority: 'completed',
        comments: 12,
        files: 15,
        assignees: ['user1', 'user2', 'user3']
      }
    ]
  },
  filter: 'all'
}

function taskReducer(state = initialState, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          todo: [...state.tasks.todo, action.payload]
        }
      }
    case 'MOVE_TASK':
      const { id, from, to } = action.payload
      const taskToMove = state.tasks[from].find(task => task.id === id)
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [from]: state.tasks[from].filter(task => task.id !== id),
          [to]: [...state.tasks[to], { ...taskToMove, priority: to === 'done' ? 'completed' : taskToMove.priority }]
        }
      }
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      }
    default:
      return state
  }
}

const store = createStore(taskReducer)

store.subscribe(() => {
  localStorage.setItem('taskState', JSON.stringify(store.getState()))
})

const TaskCard = ({ task, listType }) => {
  const dispatch = useDispatch()
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, listType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
      <Card className="mb-4">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'completed' ? 'success' : 'secondary'}>
              {task.priority}
            </Badge>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <h3 className="font-semibold mb-2">{task.title}</h3>
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center">
          <div className="flex -space-x-2">
            {task.assignees.map((user, i) => (
              <Avatar key={i} className="border-2 border-background">
                <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                <AvatarFallback>U{i + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {task.comments} comments
            </div>
            <div className="flex items-center gap-1">
              <Link2 className="h-4 w-4" />
              {task.files} files
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

const TaskList = ({ title, tasks, type }) => {
  const dispatch = useDispatch()
  const [, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => {
      if (item.listType !== type) {
        dispatch({
          type: 'MOVE_TASK',
          payload: { id: item.id, from: item.listType, to: type }
        })
      }
    },
  })

  return (
    <div ref={drop} className="flex-1 min-w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            type === 'todo' ? 'bg-primary' : 
            type === 'inProgress' ? 'bg-orange-500' : 
            'bg-green-500'
          }`} />
          <h2 className="font-semibold">{title}</h2>
          <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
        </div>
        {type === 'todo' && (
          <AddTaskDialog />
        )}
      </div>
      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} listType={type} />
        ))}
      </div>
    </div>
  )
}

const AddTaskDialog = () => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('low')
  const dispatch = useDispatch()

  const handleSubmit = (e) => {
    e.preventDefault()
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      comments: 0,
      files: 0,
      assignees: ['user1']
    }
    dispatch({ type: 'ADD_TASK', payload: newTask })
    setOpen(false)
    setTitle('')
    setDescription('')
    setPriority('low')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const Dashboard = () => {
  const tasks = useSelector(state => state.tasks)
  const filter = useSelector(state => state.filter)
  const dispatch = useDispatch()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTasks = {
    todo: tasks.todo.filter(task => 
      (filter === 'all' || task.priority === filter) &&
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    inProgress: tasks.inProgress.filter(task => 
      (filter === 'all' || task.priority === filter) &&
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    done: tasks.done.filter(task => 
      (filter === 'all' || task.priority === filter) &&
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <img src="/main-logo.png" alt="Logo" className="w-full h-full object-cover rounded-lg" />            </div>
            <span className="font-semibold">Project M.</span>
          </div>
          
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Members
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>

          <Separator className="my-4" />

          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2">MY PROJECTS</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start">
                Mobile App
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Website Redesign
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Design System
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-xl">
                <Input
                  placeholder="Search for anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>PJ</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Mobile App
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
              </h1>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => dispatch({ type: 'SET_FILTER', payload: 'low' })}>
                      Low Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => dispatch({ type: 'SET_FILTER', payload: 'high' })}>
                      High Priority
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Today
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button>Share</Button>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6">
              <TaskList
                title="To Do"
                tasks={filteredTasks.todo}
                type="todo"
              />
              <TaskList
                title="On Progress"
                tasks={filteredTasks.inProgress}
                type="inProgress"
              />
              <TaskList
                title="Done"
                tasks={filteredTasks.done}
                type="done"
              />
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  )
}

export function TaskDashboard() {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  )
}