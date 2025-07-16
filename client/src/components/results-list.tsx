import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { NicknameResult } from "../types/nickname";
import { NicknameChip } from "./nickname-chip";
import { useSavedNicknames } from "../hooks/use-saved-nicknames";

interface ResultsListProps {
  results: NicknameResult[];
  lastUpdate?: Date;
}

export function ResultsList({ results, lastUpdate }: ResultsListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const { saveNickname, copyToClipboard } = useSavedNicknames();

  const filteredResults = useMemo(() => {
    switch (activeTab) {
      case "available":
        return results.filter(r => r.status === "free");
      case "busy":
        return results.filter(r => r.status === "busy");
      case "loading":
        return results.filter(r => r.status === "loading");
      default:
        return results;
    }
  }, [results, activeTab]);

  const counts = useMemo(() => ({
    total: results.length,
    available: results.filter(r => r.status === "free").length,
    busy: results.filter(r => r.status === "busy").length,
    loading: results.filter(r => r.status === "loading").length,
  }), [results]);

  const handleSave = (nickname: string, status: "free" | "busy" | "error") => {
    saveNickname(nickname, status, nickname.length);
  };

  const handleCopy = (nickname: string) => {
    copyToClipboard(nickname);
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">검사 결과</CardTitle>
            {lastUpdate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>마지막 업데이트:</span>
                <span className="font-medium">
                  {lastUpdate.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Results Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="p-6 pb-0">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  전체 <span className="ml-1 text-gray-500">{counts.total}</span>
                </TabsTrigger>
                <TabsTrigger value="available" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  사용 가능 <span className="ml-1 text-green-500">{counts.available}</span>
                </TabsTrigger>
                <TabsTrigger value="busy" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  사용 중 <span className="ml-1 text-red-500">{counts.busy}</span>
                </TabsTrigger>
                <TabsTrigger value="loading" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  확인 중 <span className="ml-1 text-yellow-500">{counts.loading}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="all" className="mt-0">
                <ResultsContent 
                  results={filteredResults} 
                  onSave={handleSave}
                  onCopy={handleCopy}
                />
              </TabsContent>
              
              <TabsContent value="available" className="mt-0">
                <ResultsContent 
                  results={filteredResults} 
                  onSave={handleSave}
                  onCopy={handleCopy}
                />
              </TabsContent>
              
              <TabsContent value="busy" className="mt-0">
                <ResultsContent 
                  results={filteredResults} 
                  onSave={handleSave}
                  onCopy={handleCopy}
                />
              </TabsContent>
              
              <TabsContent value="loading" className="mt-0">
                <ResultsContent 
                  results={filteredResults} 
                  onSave={handleSave}
                  onCopy={handleCopy}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultsContent({ 
  results, 
  onSave, 
  onCopy 
}: { 
  results: NicknameResult[];
  onSave: (nickname: string, status: "free" | "busy" | "error") => void;
  onCopy: (nickname: string) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium mb-2">검사 결과가 없습니다</p>
        <p className="text-sm">닉네임을 입력하고 확인해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {results.map((result, index) => (
        <NicknameChip
          key={index}
          nickname={result.nickname}
          status={result.status}
          length={result.length}
          onSave={() => onSave(result.nickname, result.status)}
          onCopy={() => onCopy(result.nickname)}
        />
      ))}
    </div>
  );
}
