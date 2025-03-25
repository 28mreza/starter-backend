import { Request, Response } from 'express'
import { sakilaDB } from '../../../utils/sakilaDB'
import common from '../../../tools/common'

export const put = async (req: Request, res: Response) => {
    try {
        const data = await sakilaDB.actor.update({
            where: {
                actor_id: parseInt(req.params.id)
            },
            data: {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                last_update: new Date()
            }
        })

        return common.success(res, data, '')
    } catch (e) {
        return common.apiError(res, '', 500)
    }
}

export const del = async (req: Request, res: Response) => {
    try {
        const data = await sakilaDB.actor.delete({
            where: {
                actor_id: parseInt(req.params.id)
            },
        })

        return common.success(res, data, '')
    } catch (e) {
        return common.apiError(res, '', 500)
    }
}