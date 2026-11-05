"use client"

import { BarChart3, Boxes, ChevronRight, CircleHelp, CreditCard, LayoutDashboard, Package, Search, Settings, ShoppingBag, Truck, Users, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"

type NavItem = [label: string, icon: LucideIcon]
type Product = { name: string; meta: string; count: number; icon: LucideIcon; price: number; opening: number; added: number; closing: number }

const nav: NavItem[] = [["Overview", LayoutDashboard], ["Daily Sales", BarChart3], ["Inventory", Boxes], ["Orders", ShoppingBag], ["Suppliers", Truck], ["Customers", Users]]
const initialProducts: Product[] = [
  { name: "Premium Headphones", meta: "Electronics · SKU 1048", count: 248, icon: CreditCard, price: 42000, opening: 248, added: 0, closing: 248 },
  { name: "Canvas Backpack", meta: "Accessories · SKU 2081", count: 186, icon: Package, price: 28000, opening: 186, added: 0, closing: 186 },
  { name: "Ceramic Tumbler", meta: "Home & Living · SKU 3340", count: 124, icon: Wallet, price: 12500, opening: 124, added: 0, closing: 124 },
  { name: "Cotton Overshirt", meta: "Apparel · SKU 4092", count: 96, icon: ShoppingBag, price: 22000, opening: 96, added: 0, closing: 96 },
]
const bars = [42, 67, 52, 78, 62, 92, 73, 81, 64, 88, 72, 97]
const money = (value: number) => `₦${value.toLocaleString("en-NG")}`

export default function Home() {
  const [active, setActive] = useState("Overview")
  const [products, setProducts] = useState(initialProducts)
  const [saved, setSaved] = useState(false)
  const totals = useMemo(() => products.reduce((sum, product) => sum + (product.opening + product.added - product.closing) * product.price, 0), [products])
  const units = useMemo(() => products.reduce((sum, product) => sum + product.opening + product.added - product.closing, 0), [products])
  const isSales = active === "Daily Sales"

  function updateProduct(name: string, field: "added" | "closing", value: number) {
    setProducts((current) => current.map((product) => product.name === name ? { ...product, [field]: Math.max(0, value) } : product))
    setSaved(false)
  }

  function addSale(name: string) {
    const product = products.find((item) => item.name === name)
    if (!product || product.closing <= 0) return
    updateProduct(name, "closing", product.closing - 1)
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Image src="/stockledger-logo.png" alt="Stockledger logo" width={34} height={34} priority /></div><span>stockledger</span></div>
      <nav className="nav" aria-label="Main navigation"><div className="nav-label">Workspace</div>{nav.map(([label, Icon]) => <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)} aria-current={active === label ? "page" : undefined}><Icon size={17}/><span>{label}</span></button>)}<div className="nav-label">Manage</div><button className={active === "Reports" ? "active" : ""} onClick={() => setActive("Reports")}><BarChart3 size={17}/><span>Reports</span></button><button className={active === "Settings" ? "active" : ""} onClick={() => setActive("Settings")}><Settings size={17}/><span>Settings</span></button></nav>
      <div className="support"><p>Need a hand?</p><span>Our team is here to help you get more from your inventory.</span><button onClick={() => window.alert("Support will be with you shortly.")}>Contact support</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><p className="eyebrow">Tuesday, November 4, 2026</p><h1>{isSales ? "Daily sales" : `Good morning, Ayo`}</h1></div><div className="top-actions"><div className="search"><Search size={15}/><span>Search inventory</span></div><div className="avatar" aria-label="Ayo profile">AO</div></div></header>
      {isSales ? <section className="sales-view"><div className="page-heading"><div><p className="eyebrow">Sales calculator</p><h2>Daily Sales</h2><p>Opening + additions − closing = units sold.</p></div><button className="primary-button" onClick={() => { setSaved(true); }}>Save day</button></div><div className="sales-summary"><div className="card"><span>Sales</span><strong>{money(totals)}</strong></div><div className="card"><span>Units sold</span><strong>{units}</strong></div><div className="card"><span>Stock added</span><strong>{products.reduce((sum, product) => sum + product.added, 0)}</strong></div><div className="card"><span>Closing stock</span><strong>{products.reduce((sum, product) => sum + product.closing, 0)}</strong></div></div><div className="card sales-table"><div className="card-title"><div><h3>Stock &amp; Sales</h3><p>Update your numbers and the totals calculate instantly.</p></div><span className={saved ? "saved" : "unsaved"}>{saved ? "All changes saved" : "Unsaved changes"}</span></div><div className="table-scroll"><table><thead><tr><th>Product</th><th>Opening</th><th>Additions</th><th>Available</th><th>Closing</th><th>Sold</th><th>Revenue</th><th /></tr></thead><tbody>{products.map((product) => { const available = product.opening + product.added; const sold = Math.max(0, available - product.closing); return <tr key={product.name}><td><strong>{product.name}</strong><small>{product.meta}</small></td><td>{product.opening}</td><td><input aria-label={`Additions for ${product.name}`} type="number" min="0" value={product.added} onChange={(event) => updateProduct(product.name, "added", Number(event.target.value))}/></td><td>{available}</td><td><input aria-label={`Closing stock for ${product.name}`} type="number" min="0" max={available} value={product.closing} onChange={(event) => updateProduct(product.name, "closing", Math.min(available, Number(event.target.value)))}/></td><td className="sold-cell">{sold}</td><td>{money(sold * product.price)}</td><td><button className="small-button" onClick={() => addSale(product.name)}>Add sale</button></td></tr>})}</tbody></table></div></div></section> : <><section className="hero"><div><h2>Keep your stock moving forward.</h2><p>Everything you need to stay in control, all in one place.</p><button onClick={() => setActive("Daily Sales")}>Open daily sales <ChevronRight size={13}/></button></div><div className="hero-stat"><strong>98.4%</strong><span>inventory accuracy</span></div></section><section className="stats" aria-label="Inventory summary"><div className="card"><div className="stat-head"><span>Total products</span><span className="stat-icon"><Boxes size={15}/></span></div><div className="stat-value">1,284</div><div className="stat-foot">+12.5% this month</div></div><div className="card"><div className="stat-head"><span>Stock value</span><span className="stat-icon"><Wallet size={15}/></span></div><div className="stat-value">₦8.42m</div><div className="stat-foot">+8.2% this month</div></div><div className="card"><div className="stat-head"><span>Low stock items</span><span className="stat-icon"><Package size={15}/></span></div><div className="stat-value">24</div><div className="stat-foot">8 need attention</div></div><div className="card"><div className="stat-head"><span>Open orders</span><span className="stat-icon"><Truck size={15}/></span></div><div className="stat-value">156</div><div className="stat-foot">+18.4% this month</div></div></section><section className="grid"><div className="card"><div className="card-title"><h3>Inventory movement</h3><button onClick={() => setActive("Daily Sales")}>View daily sales</button></div><div className="chart">{bars.map((height, i) => <div className="bar-wrap" key={i}><div className="bar" style={{height:`${height}%`}}/><span className="bar-label">{["Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"][i]}</span></div>)}</div></div><div className="card"><div className="card-title"><h3>Top products</h3><button onClick={() => setActive("Inventory")}>View all <ChevronRight size={12}/></button></div><div className="product-list">{products.map(({name, meta, count, icon: Icon}) => <div className="product" key={name}><div className="product-icon"><Icon size={17}/></div><div className="product-copy"><strong>{name}</strong><span>{meta}</span></div><div className="product-count">{count}</div></div>)}</div></div></section></>}
      <div className="live-note"><CircleHelp size={14}/> {isSales ? "Sales calculations update as you type." : "Live inventory sync is active"}</div>
    </main>
  </div>
}
