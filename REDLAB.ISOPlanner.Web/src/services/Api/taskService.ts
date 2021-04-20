//import Task from '../../models/task';
import TaskDTO from '../../models/dto/taskDTO';
import http from './httpService';
import AppError from "../../utils/appError";

export async function apiGetTaskForEvent(eventId: string, eventDate: Date | undefined, accessToken: string) : Promise<TaskDTO> {

    try {
        if (eventDate) {
            const formattedEventDate: string = eventDate.toString();
            const ar = await http.get<TaskDTO>(`/tasks/event/${eventId}/${formattedEventDate}`, http.getRequestConfig(accessToken));
            return ar.data;
        } else {
            const ar = await http.get<TaskDTO>(`/tasks/event/${eventId}`, http.getRequestConfig(accessToken));
            return ar.data;
        }
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiUpdateTask(task: TaskDTO, accessToken: string) : Promise<TaskDTO> {

    try {
        const ar = await http.put<TaskDTO>('/tasks', task, http.getRequestConfig(accessToken));
        return ar.data;
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}