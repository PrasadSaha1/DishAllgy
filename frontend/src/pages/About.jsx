import Base from '../components/Base';
import { Link } from "react-router-dom";

function About() {
    return <Base>
    <div className="text-center">
        <h1 >DishAllgy</h1>
        <p>DishAllgy was created to provide a resource for those with allergens to find recipes for dishes and cuisines that avoid their allergens.
            It uses Spoonacular's API to find recipes that match the user's request.
            Users should always verify recipes by looking at the provided link to ensure that it is free of their allergens,
            as DishAllgy may not be 100% accurate.</p>

        <p>Have a question, want to report a bug, or speak to DishAllgy's developers for another reason? Contact us <Link to="/contact_us">here</Link>.</p>

        <h1 style={{ marginTop: '50px' }}>History</h1>
        <p>August Xth, 2026: Offcially Launched</p>

    </div>
    </Base>
}

export default About;