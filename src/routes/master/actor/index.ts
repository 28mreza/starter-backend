import { Request, Response } from 'express'
import { sakilaDB } from '../../../utils/sakilaDB'
import common from '../../../tools/common'

export const get = async (req: Request, res: Response) => {
    try {
        const data = await sakilaDB.actor.findMany({
            orderBy: {
                actor_id: 'desc'
            }
        })

        return common.success(res, data, '')
    } catch (e) {
        return common.apiError(res, '', 500)
    }
}

export const post = async (req: Request, res: Response) => {
    try {
        const data = await sakilaDB.actor.create({
            data: {
                first_name: req.body.first_name,
                last_name: req.body.last_name
            }
        })

        return common.success(res, data, '')
    } catch (e) {
        return common.apiError(res, '', 500)
    }
}