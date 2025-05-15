import Image from 'next/image'
import styles from './index.module.scss'
import Link from 'next/link'
import Button from '@/components/buttons/button'

export default function Header() {
  return (
    <nav className={styles.container}>
      <Image src={'/reboo-logo-text.svg'} height={40} width={130} alt='Logo do aplicativo. 2 Livros encostados com o nome "Reboo"' />
      <div className={styles.linksContainer}>
        <Link href={"/demo"}>
          <Button variant='secondary'>Demonstração do App</Button>
        </Link>
        <Link href={"/register"}>
          <Button variant='secondary'>Criar Conta</Button>
        </Link>
        <Link href={"/login"}>
          <Button>Fazer Login</Button>
        </Link>
      </div>
    </nav>
  )
}