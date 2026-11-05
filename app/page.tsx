"use client"

import { BarChart3, Boxes, ChevronRight, CircleHelp, CreditCard, LayoutDashboard, Package, Search, Settings, ShoppingBag, Truck, Users, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type NavItem = [label: string, icon: LucideIcon]
type Product = [name: string, meta: string, count: string, icon: LucideIcon]

const nav: NavItem[] = [
  ["Overview", LayoutDashboard], ["Inventory", Boxes], ["Orders", ShoppingBag], ["Suppliers", Truck], ["Customers", Users],
]
const products: Product[] = [["Premium Headphones", "Electronics · SKU 1048", "248", CreditCard], ["Canvas Backpack", "Accessories · SKU 2081", "186", Package], ["Ceramic Tumbler", "Home & Living · SKU 3340", "124", Wallet], ["Cotton Overshirt", "Apparel · SKU 4092", "96", ShoppingBag]]
const bars = [42, 67, 52, 78, 62, 92, 73, 81, 64, 88, 72, 97]

export default function Home() {
  const [active, setActive] = useState("Overview")
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Image src="/stockledger-logo.png" alt="Stockledger logo" width={34} height={34} priority /></div><span>stockledger</span></div>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-label">Workspace</div>
        {nav.map(([label, Icon]) => <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}><Icon size={17}/><span>{label}</span></button>)}
        <div className="nav-label">Manage</div>
        <button><BarChart3 size={17}/><span>Reports</span></button><button><Settings size={17}/><span>Settings</span></button>
      </nav>
      <div className="support"><p>Need a hand?</p><span>Our team is here to help you get more from your inventory.</span><button>Contact support</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><p className="eyebrow">Tuesday, November 4, 2026</p><h1>Good morning, Ayo</h1></div><div className="top-actions"><div className="search"><Search size={15}/><span>Search inventory</span></div><div className="avatar" aria-label="Ayo profile">AO</div></div></header>
      <section className="hero"><div><h2>Keep your stock moving forward.</h2><p>Everything you need to stay in control, all in one place.</p><button onClick={() => setActive("Inventory")}>View inventory <ChevronRight size={13} style={{verticalAlign:"middle"}}/></button></div><div className="hero-stat"><strong>98.4%</strong><span>inventory accuracy</span></div></section>
      <section className="stats" aria-label="Inventory summary">
        <div className="card"><div className="stat-head"><span>Total products</span><span className="stat-icon"><Boxes size={15}/></span></div><div className="stat-value">1,284</div><div className="stat-foot">+12.5% this month</div></div>
        <div className="card"><div className="stat-head"><span>Stock value</span><span className="stat-icon"><Wallet size={15}/></span></div><div className="stat-value">₦8.42m</div><div className="stat-foot">+8.2% this month</div></div>
        <div className="card"><div className="stat-head"><span>Low stock items</span><span className="stat-icon"><Package size={15}/></span></div><div className="stat-value">24</div><div className="stat-foot">8 need attention</div></div>
        <div className="card"><div className="stat-head"><span>Open orders</span><span className="stat-icon"><Truck size={15}/></span></div><div className="stat-value">156</div><div className="stat-foot">+18.4% this month</div></div>
      </section>
      <section className="grid"><div className="card"><div className="card-title"><h3>Inventory movement</h3><button>Last 12 months ▾</button></div><div className="chart">{bars.map((height, i) => <div className="bar-wrap" key={i}><div className="bar" style={{height:`${height}%`}}/><span className="bar-label">{["Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"][i]}</span></div>)}</div></div>
      <div className="card"><div className="card-title"><h3>Top products</h3><button onClick={() => setActive("Inventory")}>View all <ChevronRight size={12} style={{verticalAlign:"middle"}}/></button></div><div className="product-list">{products.map(([name, meta, count, Icon]) => <div className="product" key={name}><div className="product-icon"><Icon size={17}/></div><div className="product-copy"><strong>{name}</strong><span>{meta}</span></div><div className="product-count">{count}</div></div>)}</div></div></section>
      <div style={{display:"flex",gap:8,alignItems:"center",marginTop:22,color:"#8a978f",fontSize:11}}><CircleHelp size={14}/> Live inventory sync is active</div>
    </main>
  </div>
}
