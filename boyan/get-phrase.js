
import { promises as fs } from 'fs'
import path from 'path'
import yaml from 'yaml'

export const list = []
export const user = []

fs.readFile(path.resolve(process.cwd(), './messages.yml'), 'utf8')
  .then(file => {
    const yml = yaml.parse(file)
    yml.boyan.forEach(el => list.push(el))
    yml.user.forEach(el => user.push(el))
  })

export const getRandom = (list) => {
  return list[Math.floor(Math.random() * list.length)]
}
