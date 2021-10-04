export type TransactionData = {
    accessList: [],
    blockHash: string,
    chainId: string,
    condition: string | null,
    creates: string | null,
    blockNumber: string,
    timeStamp: string,
    from: string,
    to: string,
    contractAddress : string,
    input: string,
    type: string,
    gas: string,
    gasUsed: string,
    gasPrice: string,
    maxFeePerGas: string,
    maxPriorityFeePerGas: string,
    nonce: string,
    publicKey: string,
    r: string,
    raw: string,
    s: string,
    transactionIndex: string,
    v: string,
    value: string,
    hash: string,
}

export type Transaction = {
    id: string
    jsonrpc: string
    result: TransactionData
}

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