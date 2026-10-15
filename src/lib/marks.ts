// Личные отметки: «хочу посмотреть», «просмотрено» и оценка от 1 до 5
export type Mark = { want?: boolean; seen?: boolean; stars?: number }
export type Marks = Record<string, Mark>
