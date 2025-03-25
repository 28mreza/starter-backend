import { Request, Response } from 'express'
import { sakilaDB } from '../../../utils/sakilaDB'
import common from '../../../tools/common'

export const get = async (req: Request, res: Response) => {
    try {
        const data = await sakilaDB.film.findMany({
            orderBy: {
                film_id: 'desc'
            }
        })

        return common.success(res, data, '')
    } catch (e) {
        return common.apiError(res, '', 500)
    }
}