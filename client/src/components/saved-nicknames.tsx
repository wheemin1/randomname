import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Copy, Trash2 } from "lucide-react";
import { NicknameChip } from "./nickname-chip";
import { useSavedNicknames } from "../hooks/use-saved-nicknames";

export function SavedNicknames() {
  const { savedNicknames, removeSavedNickname, clearAllSaved, copyToClipboard } = useSavedNicknames();

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">저장된 닉네임</CardTitle>
          {savedNicknames.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllSaved}
              className="text-gray-500 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {savedNicknames.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm">저장된 닉네임이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedNicknames.map((nickname, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    nickname.status === "free" ? "bg-green-500" :
                    nickname.status === "busy" ? "bg-red-500" :
                    "bg-gray-500"
                  }`} />
                  <span className="text-sm font-medium text-gray-900">{nickname.nickname}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(nickname.nickname)}
                    className="p-1 h-auto text-gray-400 hover:text-blue-500"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSavedNickname(nickname.nickname)}
                    className="p-1 h-auto text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
