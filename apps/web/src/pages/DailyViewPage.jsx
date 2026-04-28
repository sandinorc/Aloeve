import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Users } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import SessionDetail from '@/components/SessionDetail';

export default function DailyViewPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async (date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      // PocketBase dates are stored as UTC strings, so we use >= and < for the day
      const nextDay = addDays(date, 1);
      const nextDayStr = format(nextDay, 'yyyy-MM-dd');
      
      const records = await pb.collection('sesiones').getFullList({
        filter: `fecha >= "${dateStr} 00:00:00" && fecha < "${nextDayStr} 00:00:00"`,
        sort: 'hora_inicio',
        $autoCancel: false
      });
      setSessions(records);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(selectedDate);
  }, [selectedDate]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  const openDetail = (session) => {
    setSelectedSession(session);
    setDetailOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevDay}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={handleToday}>Hoy</Button>
          <Button variant="outline" size="icon" onClick={handleNextDay}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-serif font-semibold capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </h2>
        </div>
        <div>
          <Input 
            type="date" 
            value={format(selectedDate, 'yyyy-MM-dd')} 
            onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
            className="w-auto"
          />
        </div>
      </div>

      <Card className="shadow-lg border-0 rounded-2xl min-h-[500px]">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg">No hay sesiones programadas para este día.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-16 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
              {sessions.map((session, idx) => (
                <div key={session.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="text-xs font-bold">{session.hora_inicio.split(':')[0]}h</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => openDetail(session)}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-primary font-serif">{session.tipo}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">{session.hora_inicio} - {session.hora_fin}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Facilitador: <span className="font-medium text-foreground">{session.facilitador}</span></p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center text-sm font-medium">
                        <Users className="w-4 h-4 mr-1.5 text-secondary" />
                        {session.asistentes_reales || 0} / {session.capacidad_maxima}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${session.estado === 'Cerrada' ? 'bg-muted text-muted-foreground' : 'bg-secondary/10 text-secondary'}`}>
                        {session.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SessionDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} session={selectedSession} onUpdate={() => fetchSessions(selectedDate)} />
    </motion.div>
  );
}