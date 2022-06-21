import React from 'react'
import Tilt from 'react-parallax-tilt';
import brain2 from './brain2.png'
import './Logo.css';

const Logo = () => {
  return (
    <div className='ma4 mt0'>
      <Tilt style={{width:'100px'}}>
      <div className=' Tilt br2 shadow-2' style={{ height: '100px', width:'100px'}}>
        <h1><img alt='logo' src={brain2}/></h1>
      </div>
    </Tilt>
    </div>
  )
}

export default Logo
