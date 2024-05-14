import { useEffect } from 'react'
import { getHeader } from 'services/chain'
import { calculateAPC, CONSTANTS } from 'utils'
import { type CKBComponents } from '@ckb-lumos/rpc/lib/types/api'

const { MILLISECONDS_IN_YEAR } = CONSTANTS

export const useUpdateWithdrawEpochs = ({
  isWithdrawn,
  blockHash,
  setWithdrawEpoch,
  setWithdrawTimestamp,
}: {
  isWithdrawn: boolean
  blockHash: CKBComponents.BlockHeader['hash'] | null
  setWithdrawEpoch: React.Dispatch<string>
  setWithdrawTimestamp: React.Dispatch<string>
}) => {
  useEffect(() => {
    if (isWithdrawn && blockHash) {
      getHeader(blockHash)
        .then(header => {
          setWithdrawEpoch(header.epoch)
          setWithdrawTimestamp(header.timestamp)
        })
        .catch((err: Error) => {
          console.error(err)
        })
    }
  }, [isWithdrawn, blockHash, setWithdrawEpoch, setWithdrawTimestamp])
}

export const useUpdateApc = ({
  depositTimestamp,
  genesisBlockTimestamp = 0,
  timestamp,
  tipBlockTimestamp,
  setApc,
}: {
  depositTimestamp: number
  genesisBlockTimestamp: number
  timestamp: number
  tipBlockTimestamp: number
  setApc: React.Dispatch<number>
}) => {
  useEffect(() => {
    if (depositTimestamp) {
      const startYearNumber = (depositTimestamp - genesisBlockTimestamp) / MILLISECONDS_IN_YEAR
      const endYearNumber = (timestamp - genesisBlockTimestamp) / MILLISECONDS_IN_YEAR
      try {
        const calculatedAPC = calculateAPC({
          startYearNumber,
          endYearNumber,
        })
        setApc(calculatedAPC)
      } catch (err) {
        console.error(err)
      }
    } else {
      const startYearNumber = (timestamp - genesisBlockTimestamp) / MILLISECONDS_IN_YEAR
      const endYearNumber = (tipBlockTimestamp - genesisBlockTimestamp) / MILLISECONDS_IN_YEAR
      try {
        const calculatedAPC = calculateAPC({
          startYearNumber,
          endYearNumber,
        })
        setApc(calculatedAPC)
      } catch (err) {
        console.error(err)
      }
    }
  }, [depositTimestamp, tipBlockTimestamp, timestamp, genesisBlockTimestamp, setApc])
}

export default { useUpdateWithdrawEpochs, useUpdateApc }
