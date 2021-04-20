import LoginDTO from '../../models/dto/loginDTO';
import Login from '../../models/login';
import UserDTO from '../../models/dto/userDTO';
import IdListDTO from '../../models/dto/IdListDTO';
import UserRoleDTO from '../../models/dto/userRoleDTO';
import User from '../../models/user';
import http from './httpService';
import { mapFromLogin, mapFromUsers, mapToUser, mapFromUserRoles } from '../../models/dto/dataMapping';
import AppError from "../../utils/appError";
import { appRoles } from "../Auth/appRoles";

export async function apiLoginUser(accessToken: string) : Promise<Login | undefined> {

    try {
        const ar = await http.get<LoginDTO>('/users/login', http.getRequestConfig(accessToken));
        return mapFromLogin(ar.data);
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiGetUsers(accessToken: string) : Promise<User[]> {

    try {
        const ar = await http.get<UserDTO[]>('/users', http.getRequestConfig(accessToken));
        return mapFromUsers(ar.data);
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiRemoveUsers(selectedUsers: Array<string>, accessToken: string) : Promise<void> {

    try {
        const userListDTO: IdListDTO = new IdListDTO(selectedUsers);
        await http.post<IdListDTO>('/users/delete', userListDTO, http.getRequestConfig(accessToken));
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiSetLicense(selectedUsers: Array<string>, enableLicense: boolean, accessToken: string) : Promise<void> {

    try {
        const userListDTO: IdListDTO = new IdListDTO(selectedUsers);
        await http.post<IdListDTO>(`/users/license/?enable=${enableLicense}`, userListDTO, http.getRequestConfig(accessToken));
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiAddUser(user: User, accessToken: string) : Promise<void> {

    try {
        const userDTO = mapToUser(user);
        await http.post<UserDTO>('/users', userDTO, http.getRequestConfig(accessToken));
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiGetUsersByRole(roleId: appRoles, accessToken: string) : Promise<User[]> {

    try {
        const ar = await http.get<UserRoleDTO[]>(`/users/roles/${roleId}`, http.getRequestConfig(accessToken));
        return mapFromUserRoles(ar.data);
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiSetUserRole(userId: string, roleId: appRoles, add: boolean, accessToken: string): Promise<void> {

    try {
        const userRoleDTO = new UserRoleDTO();
        userRoleDTO.userId = userId;
        userRoleDTO.roleId = roleId;
        await http.post<IdListDTO>(`/users/roles/?add=${add}`, userRoleDTO, http.getRequestConfig(accessToken));
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiUpdateUser(user: User, accessToken: string): Promise<void> {

    try {
        const userDTO = mapToUser(user);
        await http.put<UserDTO>(`/users`, userDTO, http.getRequestConfig(accessToken));
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}