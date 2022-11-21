interface GridState {
    cell: number; user: string; 
}

interface State extends Array<GridState>{}


interface Winner {
    player: String, won: boolean
}


export type {State, GridState, Winner}