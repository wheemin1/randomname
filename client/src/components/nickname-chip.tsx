import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NicknameChipProps {
  nickname: string;
  status: "free" | "busy" | "loading" | "error";
  length: number;
  onSave?: () => void;
  onCopy?: () => void;
  onRemove?: () => void;
  isSaved?: boolean;
  showActions?: boolean;
}

export function NicknameChip({
  nickname,
  status,
  length,
  onSave,
  onCopy,
  onRemove,
  isSaved = false,
  showActions = true,
}: NicknameChipProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-red-100 text-red-800 border-red-200";
      case "loading":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "free":
        return "사용 가능";
      case "busy":
        return "사용 중";
      case "loading":
        return "확인 중";
      case "error":
        return "오류";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <div className={cn(
          "w-3 h-3 rounded-full",
          status === "free" && "bg-green-500",
          status === "busy" && "bg-red-500",
          status === "loading" && "bg-yellow-500 animate-pulse",
          status === "error" && "bg-gray-500"
        )} />
        <span className="font-medium text-gray-900">{nickname}</span>
        <span className="text-sm text-gray-500">{length}글자</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className={cn("text-xs", getStatusColor(status))}>
          {getStatusText(status)}
        </Badge>
        
        {showActions && (
          <div className="flex items-center space-x-1">
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className={cn(
                  "p-1 h-auto",
                  isSaved ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
                )}
              >
                <Star className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
              </Button>
            )}
            
            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="p-1 h-auto text-gray-400 hover:text-blue-500"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
            
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="p-1 h-auto text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
