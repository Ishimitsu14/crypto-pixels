export type IERC721 = {
    blockNumber: string
    timeStamp: string
    hash: string
    nonce: string
    blockHash: string
    from: string
    contractAddress: string
    to: string
    tokenID: string
    tokenName: string
    tokenSymbol: string
    tokenDecimal: string
    transactionIndex: string
    gas: string
    gasPrice: string
    gasUsed: string
    cumulativeGasUsed: string
    input: string
    confirmations: string
}

export type IERC721List = {
    status: string
    message: string
    result: IERC721[]
}