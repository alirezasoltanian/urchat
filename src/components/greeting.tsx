import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Code, Compass, GraduationCap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
const actionButtons = [
  { icon: Sparkles, label: "Create" },
  { icon: Compass, label: "Explore" },
  { icon: Code, label: "Code" },
  { icon: GraduationCap, label: "Learn" },
];

const exampleQuestions = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];
export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-2 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        How can I help you
      </motion.div>
      {/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-zinc-500"
      >
        How can I help you today?
      </motion.div> */}
      <div className="flex flex-wrap gap-3 mb-6">
        {actionButtons.map((button, index) => (
          <Button
            key={index}
            variant="secondary"
            size="lg"
            className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground border border-border"
          >
            <button.icon className="size-4" />
            {button.label}
          </Button>
        ))}
      </div>

      {/* Example questions */}
      <div className="space-y-2">
        {exampleQuestions.map((question, index) => (
          <div
            key={index}
            className={cn(
              index !== question.length - 1 && "border-b",
              "p-4 hover:bg-card/70 border-border cursor-pointer"
            )}
          >
            <p className="text-card-foreground font-medium">{question}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
