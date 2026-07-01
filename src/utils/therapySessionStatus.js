const isSlotInProgress = (dayRecord) =>
    Boolean(dayRecord?.startTime && !dayRecord?.endTime && !dayRecord?.completed);

const findDayRecord = (days, slotDate) => {
    if (!Array.isArray(days)) return null;
    const target = new Date(slotDate);
    target.setHours(0, 0, 0, 0);
    return days.find((day) => {
        if (!day?.date) return false;
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === target.getTime();
    }) || null;
};

export const getSessionSlotCounts = (session) => {
    const total = Number(session?.daysOfTreatment) || 0;
    const days = Array.isArray(session?.days) ? session.days : [];

    if (total === 0) {
        return {
            total: 0,
            completed: days.filter((d) => d?.completed).length,
            missed: 0,
            hasInProgress: false,
            hasTodayPending: false,
            hasFuture: false,
        };
    }

    const timeline = session.timeline || "Daily";
    const stepDays = timeline === "Weekly" ? 7 : (timeline === "AlternateDay" ? 2 : 1);
    const startDate = session.sessionDate ? new Date(session.sessionDate) : new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let completed = 0;
    let missed = 0;
    let hasInProgress = false;
    let hasTodayPending = false;
    let hasFuture = false;

    for (let i = 0; i < total; i++) {
        const slotDate = new Date(startDate);
        slotDate.setDate(startDate.getDate() + i * stepDays);
        slotDate.setHours(0, 0, 0, 0);

        const dayRecord = findDayRecord(days, slotDate);
        const inProgress = isSlotInProgress(dayRecord);
        let isCompleted = Boolean(dayRecord?.completed);
        if (session.status === "Completed") isCompleted = true;
        const isPast = slotDate.getTime() < today.getTime();
        const isToday = slotDate.getTime() === today.getTime();

        if (isCompleted) {
            completed += 1;
        } else if (inProgress) {
            hasInProgress = true;
        } else if (isPast) {
            missed += 1;
        } else if (isToday) {
            hasTodayPending = true;
        } else {
            hasFuture = true;
        }
    }

    return { total, completed, missed, hasInProgress, hasTodayPending, hasFuture };
};

export const getEffectiveSessionStatus = (session) => {
    const {
        total,
        completed,
        missed,
        hasInProgress,
        hasTodayPending,
        hasFuture,
    } = getSessionSlotCounts(session);

    if (total === 0) {
        return session?.status || "Pending";
    }

    if (completed >= total) return "Completed";
    if (hasInProgress) return "In Progress";
    if (completed > 0 && (completed + missed) >= total && !hasTodayPending && !hasFuture) return "Completed";
    if (completed > 0 && (hasTodayPending || hasFuture)) return "In Progress";
    if (missed === total) return "Missed";
    if (missed > 0 && (hasTodayPending || hasFuture)) return "In Progress";
    if (hasTodayPending) return "Pending";
    if (hasFuture && completed === 0 && missed === 0) return "Scheduled";

    return session?.status || "Scheduled";
};
