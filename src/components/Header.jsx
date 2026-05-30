export default function Header({ user, onSignOut }) {
  const firstName = user.displayName?.split(' ')[0] || user.email

  return (
    <header className="header">
      <div className="header-brand">
        🏠 Household Budget
        <span>Frisbee-Plascencia</span>
      </div>
      <div className="header-right">
        <span className="header-user">👤 {firstName}</span>
        <button className="btn-signout" onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  )
}
