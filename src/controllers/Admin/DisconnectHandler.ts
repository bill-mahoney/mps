/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
* Description: Handler to disconnect a device
**********************************************************************/

import { logger as log } from '../../utils/logger'
import { IAdminHandler } from '../../models/IAdminHandler'
import { Response, Request } from 'express'
import { ErrorResponse } from '../../utils/amtHelper'
import { MPSMicroservice } from '../../mpsMicroservice'

export class DisconnectHandler implements IAdminHandler {
  mps: MPSMicroservice
  name: string

  constructor (mps: MPSMicroservice) {
    this.name = 'Disconnect'
    this.mps = mps
  }

  // Get existing device list from credentials file.
  // For the server version of Mesh Commander, we send the computer list without credential and insertion credentials in the stream.
  async adminAction (req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body.payload
      // Check if request body contains guid information
      if (payload.guid) {
        // check if guid is connected
        const ciraconn = this.mps.mpsserver.ciraConnections[payload.guid]
        if (ciraconn) {
          try {
            ciraconn.destroy()
            res.set({ 'Content-Type': 'application/json' })
            res.send(
              JSON.stringify(
                `{ success: 200, description: 'CIRA connection disconnected : ${payload.guid}'}`
              )
            )
          } catch (error) {
            log.error(error)
            res.set({ 'Content-Type': 'application/json' })
            res.status(500).send(ErrorResponse(500, error))
          }
        } else {
          res.set({ 'Content-Type': 'application/json' })
          res.status(404).send(ErrorResponse(404, `guid : ${payload.guid}`, 'device'))
        }
      } else {
        res.set({ 'Content-Type': 'application/json' })
        res.status(404).send(ErrorResponse(404, null, 'guid'))
      }
    } catch (error) {
      log.error(`Exception in Disconnect: ${JSON.stringify(error)} `)
      res.status(500).send(ErrorResponse(500, 'Request failed while disconnecting device.'))
    }
  }
}
