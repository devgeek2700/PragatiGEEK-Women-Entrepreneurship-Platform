import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const Particle = ({ option }) => {
    const particlesInit = async (main) => {
        await loadFull(main);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1
        }}>
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={option}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
};

export default Particle;
