
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Heart, Brain, Lungs, Eye, Bone, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const featuredContent = [
    {
      id: 1,
      title: "Brain Structure and Function",
      description: "Comprehensive guide to neuroanatomy and cognitive functions",
      category: "Neuroanatomy",
      image: "https://images.unsplash.com/photo-1559757175-7cb034ecac37?q=80&w=500&auto=format&fit=crop",
      icon: <Brain />,
      popularity: 98
    },
    {
      id: 2,
      title: "Cardiovascular System",
      description: "Detailed exploration of the heart and blood vessels",
      category: "Cardiovascular",
      image: "https://images.unsplash.com/photo-1628595351029-c2111d8482c0?q=80&w=500&auto=format&fit=crop",
      icon: <Heart />,
      popularity: 94
    },
    {
      id: 3,
      title: "Respiratory System",
      description: "Complete walkthrough of the lungs and breathing mechanisms",
      category: "Respiratory",
      image: "https://images.unsplash.com/photo-1584555613483-3b107cbe85c3?q=80&w=500&auto=format&fit=crop",
      icon: <Lungs />,
      popularity: 92
    },
    {
      id: 4,
      title: "Visual System Anatomy",
      description: "Detailed examination of eye structure and visual pathways",
      category: "Sensory",
      image: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=500&auto=format&fit=crop",
      icon: <Eye />,
      popularity: 86
    },
    {
      id: 5,
      title: "Musculoskeletal System",
      description: "Comprehensive overview of bones, joints, and muscles",
      category: "Musculoskeletal",
      image: "https://images.unsplash.com/photo-1611601322175-ef8ec8c85f01?q=80&w=500&auto=format&fit=crop",
      icon: <Bone />,
      popularity: 89
    },
    {
      id: 6,
      title: "Digestive Tract Anatomy",
      description: "Exploration of the digestive system from mouth to rectum",
      category: "Digestive",
      image: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?q=80&w=500&auto=format&fit=crop",
      icon: <Activity />,
      popularity: 84
    }
  ];

  const filteredContent = featuredContent.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-medium text-lg tracking-tight">Studio Anatomy</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/explore" className="text-sm font-medium text-primary transition-colors">Explore</Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold mb-2">Explore Anatomy</h1>
          <p className="text-muted-foreground">Discover comprehensive resources and interactive models</p>
        </motion.div>

        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search anatomy content..."
            className="pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button size="icon" variant="ghost" className="absolute right-2 top-2">
            <Filter className="h-4 w-4" />
          </Button>
        </motion.div>

        <Tabs defaultValue="featured">
          <TabsList className="mb-8">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {filteredContent.map((item) => (
                <motion.div 
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5 }
                    }
                  }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="font-medium">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{item.title}</CardTitle>
                        <div className="bg-primary/10 p-2 rounded-full">
                          {item.icon}
                        </div>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-sm text-muted-foreground">
                        Popularity: {item.popularity}%
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/anatomy/${item.id}`} className="flex items-center justify-center gap-2">
                          Explore
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {filteredContent.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Recently viewed content will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Most popular content will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/40 py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-medium">Studio Anatomy</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Studio Anatomy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Explore;
