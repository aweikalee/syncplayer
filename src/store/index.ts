import { config } from './config'
import { player } from './player'
import { source } from './source'
import { user } from './user'

export const store = reactive({
  config,
  player,
  source,
  user,
})
