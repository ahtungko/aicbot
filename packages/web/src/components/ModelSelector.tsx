import { Check, ChevronDown } from 'lucide-react';
import type { Model } from '@aicbot/shared';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ModelSelectorProps {
  models?: Model[];
  selectedModelId?: string;
  onSelect: (modelId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string | null;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelect,
  isLoading,
  disabled,
  error,
}) => {
  const selectedModel = models?.find(model => model.id === selectedModelId);

  if (isLoading) {
    return <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />;
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  if (!models || models.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No models available</div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[12rem] justify-between gap-2"
          disabled={disabled}
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium leading-tight">
              {selectedModel ? selectedModel.name : 'Select a model'}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {selectedModel?.description || 'Choose a model for this chat'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="start" side="bottom">
        {models.map(model => {
          const isSelected = model.id === selectedModelId;

          return (
            <DropdownMenuItem
              key={model.id}
              className="flex items-start justify-between gap-3"
              onSelect={() => onSelect(model.id)}
            >
              <div className="flex-1">
                <div className="font-medium leading-tight">{model.name}</div>
                {model.description && (
                  <div className="text-xs text-muted-foreground leading-tight">
                    {model.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground leading-tight">
                  Max tokens: {model.maxTokens}
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
