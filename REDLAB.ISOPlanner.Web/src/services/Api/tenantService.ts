import TenantDTO from '../../models/dto/tenantDTO';
import LicenseDTO from '../../models/dto/licenseDTO';
import Tenant from '../../models/tenant';
import http from './httpService';
import { mapFromTenant, mapFromTenantLicenses } from '../../models/dto/dataMapping';
import AppError from "../../utils/appError";

export async function apiGetTenant(accessToken: string) : Promise<Tenant> {

    try {
        const ar = await http.get<TenantDTO>('/tenant', http.getRequestConfig(accessToken));
        return mapFromTenant(ar.data);
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}

export async function apiGetTenantLicenses(tenant: Tenant, accessToken: string) : Promise<Tenant> {

    try {
        const ar = await http.get<LicenseDTO>('/tenant/licenses', http.getRequestConfig(accessToken));
        return mapFromTenantLicenses(tenant, ar.data);
    }
    catch (err) {
        throw AppError.fromApiError(err);
    }
}