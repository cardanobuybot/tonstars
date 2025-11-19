// apps/web/app/privacy/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | TonStars',
  description:
    'Политика конфиденциальности сервиса TonStars — покупка Telegram Stars за TON без хранения средств пользователей.',
  alternates: {
    languages: {
      ru: 'https://www.tonstars.io/privacy',
      en: 'https://www.tonstars.io/en/privacy',
      'x-default': 'https://www.tonstars.io/privacy',
    },
  },
};

export default function PrivacyRuPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px 16px 40px',
        maxWidth: 860,
        margin: '0 auto',
        color: '#e5edf5',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>
        Политика конфиденциальности
      </h1>
      <div style={{ opacity: 0.7, marginBottom: 24, fontSize: 14 }}>
        Последнее обновление: 01.06.2025
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>1. Введение</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Эта Политика описывает обработку данных при использовании платформы{' '}
          <strong>TonStars</strong>. Используя Платформу, вы соглашаетесь с её
          условиями.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>2. Какие данные мы используем</h2>

        <h3 style={{ fontSize: 16, marginTop: 12, marginBottom: 4 }}>
          2.1. Данные аккаунта
        </h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Возможен вход через Telegram или подключение TON-кошелька. Мы не
          связываем эти данные между собой и не храним IP-адреса или
          идентификаторы устройств на стороне Платформы.
        </p>

        <h3 style={{ fontSize: 16, marginTop: 12, marginBottom: 4 }}>
          2.2. История транзакций
        </h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Все операции записываются в публичной сети TON. Управление средствами
          осуществляется только через ваши кошельки, TonStars не хранит и не
          контролирует ваши активы.
        </p>

        <h3 style={{ fontSize: 16, marginTop: 12, marginBottom: 4 }}>
          2.3. Анонимная статистика
        </h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Мы можем собирать обезличенные технические данные (тип устройства,
          браузер, страна, базовые лог-записи) до 6&nbsp;месяцев для защиты от
          мошенничества и улучшения работы сервиса.
        </p>

        <h3 style={{ fontSize: 16, marginTop: 12, marginBottom: 4 }}>
          2.4. Cookies и local storage
        </h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Используем cookies и локальное хранилище браузера для сохранения
          языка интерфейса и статуса подключения кошелька. Вы можете
          отключить cookies в настройках браузера, но часть функций сервиса
          может перестать работать.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>3. Как мы используем данные</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Мы не храним пользовательские средства и не связываем платежи в сети
          TON с конкретными логинами. Временно могут храниться только настройки
          интерфейса (например, язык) и технические записи для поддержки и
          безопасности.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>4. Передача третьим лицам</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Персональные данные в рамках сервиса не передаются третьим лицам.
          Операции в сети TON являются публичными по природе блокчейна. По
          законным запросам регуляторов может быть предоставлена обезличенная
          техническая статистика.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>5. Ваши права</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Поскольку персонализированные данные почти не обрабатываются и не
          хранятся на нашей стороне, запросы на удаление обычно не требуются.
          Вы можете прекратить использование сервиса в любой момент, просто
          отключив кошелёк и не заходя на сайт.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>6. Сторонние сервисы</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          При использовании TonStars вы также взаимодействуете со сторонними
          сервисами: Telegram, TON-кошельки (Tonkeeper, MyTonWallet, OpenMask),
          TON-обозреватели, инфраструктура хостинга (например, Vercel,
          Cloudflare). У каждого из этих сервисов своя политика
          конфиденциальности, с которой вам следует ознакомиться отдельно.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>7. Безопасность</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Мы применяем технические меры защиты, соответствующие типу сервиса.
          Платформа работает в non-custodial формате: безопасность активов
          зависит от того, как вы храните свои кошельки и доступ к ним.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>8. Международные передачи</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Данные транзакций распределены по нодам сети TON во всём мире — это
          свойство публичного блокчейна и не контролируется нами централизованно.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>9. Изменения</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Актуальная версия Политики всегда доступна на этой странице. Дата
          последнего обновления указана выше. Мы можем обновлять Политику по
          мере развития сервиса.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>10. Контакты</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Telegram: <a href="https://t.me/tonstars_support">@tonstars_support</a>
          <br />
          Сайт: <a href="https://www.tonstars.io">tonstars.io</a>
        </p>
      </section>
    </main>
  );
}
