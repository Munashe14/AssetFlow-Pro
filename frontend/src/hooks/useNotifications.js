import { useState, useEffect } from "react";
import { getNotifications, markAllRead, markRead } from "../api/notification";

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);

    async function load() {
        const res = await getNotifications();
        setNotifications(res.data);
    }

    useEffect(() => {
        load();
        // Poll every 60 seconds for new notifications
        const interval = setInterval(load, 60_000);
        return () => clearInterval(interval);
    }, []);

    async function handleMarkRead(id) {
        await markRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
    }

    async function handleMarkAllRead() {
        await markAllRead();
        setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return {notifications, unreadCount, markRead: handleMarkRead, markAllRead: handleMarkAllRead};
}