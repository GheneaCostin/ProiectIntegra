    import * as Notifications from 'expo-notifications';

    /**
     * EXERCIȚIU: Programarea notificărilor bazate pe frecvență.
     * Interval orar: 08:00 - 22:00 (14 ore disponibile)
     * Formula: Interval = 14 ore / frecvență
     * * UPDATE: Grupăm tratamentele pe ore pentru a trimite o singură notificare cumulată.
     */
    export const scheduleTreatmentNotifications = async (treatments) => {
        if (!Notifications || !Notifications.scheduleNotificationAsync) {
            console.warn("Modulul 'expo-notifications' nu este gata.");
            return;
        }

        try {

            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                console.log("Nu există permisiuni pentru notificări!");
                return;
            }

            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log("Notificările anterioare au fost anulate.");

            const START_HOUR = 8;
            const END_HOUR = 22;
            const TOTAL_HOURS = END_HOUR - START_HOUR; // 14 ore


            const scheduleMap = {};


            for (const treatment of treatments) {
                const freq = treatment.frequency || treatment.frequencyPerDay || 1;
                const treatmentName = treatment.medicationName || treatment.medicineName || "Medicament";
                const dosage = treatment.dosage ? `(${treatment.dosage})` : "";


                const entryText = `${treatmentName} ${dosage}`.trim();


                const intervalHours = TOTAL_HOURS / freq;

                for (let i = 0; i < freq; i++) {
                    const currentHourDecimal = START_HOUR + (i * intervalHours);

                    const triggerHour = Math.floor(currentHourDecimal);
                    const triggerMinute = Math.floor((currentHourDecimal - triggerHour) * 60);


                    const timeKey = `${triggerHour}_${triggerMinute}`;

                    if (!scheduleMap[timeKey]) {
                        scheduleMap[timeKey] = [];
                    }

                    scheduleMap[timeKey].push(entryText);
                }
            }


            let notificationsCount = 0;

            for (const timeKey in scheduleMap) {
                const [hourStr, minuteStr] = timeKey.split('_');
                const hour = parseInt(hourStr);
                const minute = parseInt(minuteStr);
                const medsList = scheduleMap[timeKey];


                const bodyText = `Ia acum: ${medsList.join(', ')}`;
                const minuteFormatted = minute < 10 ? `0${minute}` : minute;

                console.log(`Programare GRUPATĂ la ${hour}:${minuteFormatted} -> ${bodyText}`);

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `💊 Ora ${hour}:${minuteFormatted} - Tratamente`,
                        body: bodyText,
                        sound: true,
                        priority: Notifications.AndroidNotificationPriority.HIGH,
                        channelId: 'default',
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DAILY,
                        hour: hour,
                        minute: minute,
                    },
                });
                notificationsCount++;
            }

            console.log(`S-au programat ${notificationsCount} notificări grupate pentru ${treatments.length} medicamente.`);

        } catch (error) {
            console.error("Eroare la programarea notificărilor:", error);
        }
    };