import { User } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";

interface UserInfoSectionProps {
  ageGroup: string;
  gender: string;
  onAgeGroupChange: (value: string) => void;
  onGenderChange: (value: string) => void;
}

export function UserInfoSection({
  ageGroup,
  gender,
  onAgeGroupChange,
  onGenderChange,
}: UserInfoSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
          <User className="w-5 h-5 text-gray-900 dark:text-white" />
        </div>
        <h2 className="font-semibold">사용자 정보</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">연령대</Label>
          <Select value={ageGroup} onValueChange={onAgeGroupChange}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="연령대를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10s">10대</SelectItem>
              <SelectItem value="20s">20대</SelectItem>
              <SelectItem value="30s">30대</SelectItem>
              <SelectItem value="40s">40대</SelectItem>
              <SelectItem value="50s">50대</SelectItem>
              <SelectItem value="60s">60대 이상</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">성별</Label>
          <RadioGroup value={gender} onValueChange={onGenderChange} className="mt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <RadioGroupItem value="male" id="male" className="peer sr-only" />
                <Label
                  htmlFor="male"
                  className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all peer-data-[state=checked]:border-gray-900 dark:peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-gray-50 dark:peer-data-[state=checked]:bg-gray-800 hover:border-gray-300"
                >
                  남성
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="female"
                  id="female"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="female"
                  className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all peer-data-[state=checked]:border-gray-900 dark:peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-gray-50 dark:peer-data-[state=checked]:bg-gray-800 hover:border-gray-300"
                >
                  여성
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="other" id="other" className="peer sr-only" />
                <Label
                  htmlFor="other"
                  className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all peer-data-[state=checked]:border-gray-900 dark:peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-gray-50 dark:peer-data-[state=checked]:bg-gray-800 hover:border-gray-300"
                >
                  기타
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}