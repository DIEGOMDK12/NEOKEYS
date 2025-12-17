import Header from "../Header";

export default function HeaderExample() {
  return (
    <Header
      cartCount={2}
      onMenuClick={() => console.log("Menu clicked")}
      onCartClick={() => console.log("Cart clicked")}
      onUserClick={() => console.log("User clicked")}
      onSearch={(q) => console.log("Search:", q)}
    />
  );
}
