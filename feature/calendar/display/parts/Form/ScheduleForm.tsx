import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/feature/calendar/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { ja } from "date-fns/locale";
import { format } from "date-fns";

export const ScheduleForm = (props: any) => {
  const { title, allDay, startDate, startTime, endDate, endTime, addEvent } = props;
  const { eventsTitle, setEventsTitle } = title;
  const { isAllDay, setIsAllDay } = allDay;
  const { eventsStartDate, setEventsStartDate } = startDate;
  const { eventsStartTime, setEventsStartTime } = startTime;
  const { eventsEndDate, setEventsEndDate } = endDate;
  const { eventsEndTime, setEventsEndTime } = endTime;
  // フォーム用のスキーマ
  const scheduleSchema = z.object({
    title: z
      .string()
      .min(1, { message: "Title must be at least 1 characters." }),
    all_day: z.boolean().default(false).optional(),
    start_date: z.date({
      required_error: "A date of start schedule is required.",
    }),
    start_time: z
      .string()
      .min(4, { message: "A time of start schedule is required" }),
    end_date: z.date({ required_error: "A date of end schedule is required." }),
    end_time: z
      .string()
      .min(4, { message: "A time of end schedule is required" }),
  });

  const form = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
  });

  /**
   * Date型のオブジェクトを”〇〇月〇〇日(曜日)”の形にフォーマットする
   * @param date
   * @returns {string} 日本語にフォーマットした日付を返す
   */
  const formatCaption = (date: Date | undefined) => {
    if (!date) {
      return;
    }
    const dayArr = ["日", "月", "火", "水", "木", "金", "土"];
    const day = format(date, "MM月dd日");
    return `${day}(${dayArr[date.getDay()]})`;
  };

  const handleToggle = (e: boolean) => {
    setIsAllDay(e); // isAlldayを変える関数。逆になってない？
    // 終日設定がTrueの時、開始時間と終了時間を00:00にする。
    if (e) {
      form.setValue("start_time", "00:00");
      setEventsStartTime("00:00");
      form.setValue("end_time", "00:00");
      setEventsEndTime("00:00");
    }
    console.log(e)
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(addEvent)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-md">
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="title"
                    onChange={(e) => {
                      field.onChange(e.target.value); // field.onChangeを呼び出す
                      setEventsTitle(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="all_day"
            render={({ field }) => (
              <FormItem className="flex w-md justify-between">
                <FormLabel>終日</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange();
                      handleToggle(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex justify-between w-md">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="w-full mr-2">
                  <FormLabel>開始日</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon />
                        <span>{formatCaption(field.value)}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        locale={ja}
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          setEventsStartDate(date);
                          field.onChange(date);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>開始時刻</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setEventsStartTime(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-between w-md">
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="w-full mr-2">
                  <FormLabel>終了日</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon />
                          <span>{formatCaption(field.value)}</span>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        locale={ja}
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          setEventsEndDate(date);
                          field.onChange(date); // Update the form state with the selected date
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>終了時刻</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setEventsEndTime(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">保存</Button>
        </form>
      </Form>
    </div>
  );
};