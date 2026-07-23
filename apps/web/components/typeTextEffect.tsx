import { Typewriter } from 'react-simple-typewriter';


export default function TypewriterEffectSmoothDemo(obj: { text: string}) {
    return (
        <div>
            <Typewriter
                words={[obj.text]}
                loop={0} // 0 = once, Infinity = repeat
                cursor
                cursorStyle="|"
                typeSpeed={40}
                deleteSpeed={90}
                delaySpeed={3000}
            />
        </div>
    )
}   