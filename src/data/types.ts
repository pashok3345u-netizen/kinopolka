export type Genre =
  | 'комедия'
  | 'драма'
  | 'мелодрама'
  | 'ужасы'
  | 'триллер'
  | 'фантастика'
  | 'фэнтези'
  | 'боевик'
  | 'приключения'
  | 'детектив'
  | 'криминал'
  | 'мультфильм'
  | 'аниме'
  | 'семейный'
  | 'мюзикл'
  | 'военный'
  | 'исторический'
  | 'биография'
  | 'спорт'

// Настроение: laugh — посмеяться, cry — поплакать, love — романтика, cozy — уютно,
// scary — страшно, thrill — адреналин, think — подумать, mind — взрыв мозга
export type Mood = 'laugh' | 'cry' | 'love' | 'cozy' | 'scary' | 'thrill' | 'think' | 'mind'

export type Film = {
  title: string // название по-русски
  original?: string // оригинальное название (у наших фильмов не нужно)
  year: number
  country: string[]
  minutes: number // длительность в минутах
  genres: Genre[]
  moods: Mood[]
  director: string
  cast: string[] // главные актёры (у мультфильмов может быть пусто)
  about: string // о чём фильм — коротко и без спойлеров
  adult?: true // 18+
}
