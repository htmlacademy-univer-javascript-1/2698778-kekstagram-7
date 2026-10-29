const isMeetingInWorkTime = (workStart, workEnd, meetingStart, meetingDuration) => {
  const parseToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  };

  const workStartMinutes = parseToMinutes(workStart);
  const workEndMinutes = parseToMinutes(workEnd);
  const meetingStartMinutes = parseToMinutes(meetingStart);
  const meetingEndMinutes = meetingStartMinutes + meetingDuration;

  return meetingStartMinutes >= workStartMinutes && meetingEndMinutes <= workEndMinutes;
};
isMeetingInWorkTime('08:00', '17:30', '14:00', 90);  // true
