import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function FacilitadorCalendarView({ talleres = [], currentMonth = new Date() }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month to align with correct weekday (0 = Sunday, 1 = Monday...)
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => null);
  
  const allDays = [...paddingDays, ...daysInMonth];

  const getSpecialtyColor = (specialty) => {
    const colors = {
      'Yoga': 'bg-[hsl(var(--spec-yoga))] text-white',
      'Pilates': 'bg-[hsl(var(--spec-pilates))] text-white',
      'Meditación': 'bg-[hsl(var(--spec-meditation))] text-white',
      'Fitness': 'bg-[hsl(var(--spec-fitness))] text-white',
      'Danza': 'bg-[hsl(var(--spec-dance))] text-white',
      'Artes': 'bg-[hsl(var(--spec-arts))] text-white',
    };
    return colors[specialty] || 'bg-[hsl(var(--spec-default))] text-white';
  };

  const getTalleresForDay = (date) => {
    if (!date) return [];
    return talleres.filter(t => {
      if (!t.expand?.taller_id?.fecha) return false;
      const tallerDate = parseISO(t.expand.taller_id.fecha.split(' ')[0]);
      return isSameDay(tallerDate, date);
    });
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-serif text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-border">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {allDays.map((date, i) => {
          const dayTalleres = getTalleresForDay(date);
          const isToday = date && isSameDay(date, new Date());
          
          return (
            <div 
              key={i} 
              className={cn(
                "min-h-[100px] bg-card p-2 transition-colors",
                !date && "bg-muted/20",
                isToday && "bg-primary/5"
              )}
            >
              {date && (
                <>
                  <div className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                    isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {format(date, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTalleres.map((asignacion) => {
                      const taller = asignacion.expand?.taller_id;
                      if (!taller) return null;
                      return (
                        <div 
                          key={asignacion.id}
                          className={cn(
                            "text-[10px] p-1 rounded truncate cursor-pointer hover:opacity-90 transition-opacity",
                            getSpecialtyColor(taller.tipo)
                          )}
                          title={`${taller.title || taller.tipo} (${taller.hora_inicio} - ${taller.hora_fin})`}
                        >
                          {taller.hora_inicio} {taller.title || taller.tipo}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}