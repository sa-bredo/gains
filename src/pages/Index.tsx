import { Link } from "react-router-dom";
import { FileText, Table, CheckSquare, MessageSquare, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FileText size={16} />
              Knowledge Base System
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-6">
              Your team's
              <span className="block text-primary">knowledge hub</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A beautiful Coda-inspired document editor with rich blocks, inline tables, 
              and multiple views. Organize everything in one place.
            </p>

            <Link
              to="/knowledge-base"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 shadow-lg shadow-primary/20 kb-transition group"
            >
              Open Knowledge Base
              <ArrowRight size={20} className="group-hover:translate-x-1 kb-transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<FileText className="text-primary" size={24} />}
            title="Rich Documents"
            description="Create beautiful documents with headings, lists, callouts, and more."
          />
          <FeatureCard
            icon={<Table className="text-primary" size={24} />}
            title="Inline Tables"
            description="Embed powerful tables with 10+ column types directly in your docs."
          />
          <FeatureCard
            icon={<CheckSquare className="text-primary" size={24} />}
            title="Task Tracking"
            description="Track to-dos and checklists within your documents."
          />
          <FeatureCard
            icon={<MessageSquare className="text-primary" size={24} />}
            title="Callouts"
            description="Highlight important information with styled callout blocks."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to get organized?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Start creating beautiful documents and tables for your team today.
            </p>
            <Link
              to="/knowledge-base"
              className="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-lg font-semibold hover:bg-background/90 kb-transition"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 kb-transition group">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 kb-transition">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;