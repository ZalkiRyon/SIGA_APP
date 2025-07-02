import { describe, it, expect } from 'vitest';
import Navbar from '../Navbar';

describe('Navbar', () => {
    it('renders correctly', () => {
        const navbar = shallow(<Navbar />);
        expect(navbar.exists()).toBe(true);
    });

    it('contains the correct title', () => {
        const navbar = shallow(<Navbar title="My App" />);
        expect(navbar.find('h1').text()).toBe('My App');
    });
});