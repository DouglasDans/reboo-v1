import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import * as user_json from '../../assets/user.json'

@Injectable()
export class UserDemoService {
  constructor(private userService: UserService) {}

  async createUser() {
    const password = Math.random().toString(36).substring(2, 12)
    const user = await this.userService.createUser({
      name: user_json.name,
      email:
        user_json.email +
        Math.random().toString(36).substring(3, 14) +
        '@test.com',
      password: password,
    })

    user.password = password
    return user
  }
}
