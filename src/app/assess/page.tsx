'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAssessmentStore } from '@/lib/store/assessmentStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestionDef {
  id: string;
  text: string;
  scale: { min: number; max: number; labels: string[] };
  reversed?: boolean;
  isCrisisItem?: boolean;
  hasContentWarning?: boolean;
  contentWarning?: string;
}

interface InstrumentDef {
  id: string;
  name: string;
  preamble?: string;
  questions: QuestionDef[];
}

interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  instruments: InstrumentDef[];
}

// ---------------------------------------------------------------------------
// Instrument Data — imported from existing files, mapped to our structure.
// All instrument data is defined inline below to keep this page self-contained.
// The canonical question data lives in /src/lib/instruments/*.ts and these
// arrays mirror those files exactly.
// ---------------------------------------------------------------------------

const BFI2_SCALE = { min: 1, max: 5, labels: ['Disagree strongly', 'Disagree a little', 'Neutral', 'Agree a little', 'Agree strongly'] };

const bfi2Questions: QuestionDef[] = [
  // Extraversion - Sociability
  { id: 'bfi2_01', text: 'I am the life of the party.', scale: BFI2_SCALE },
  { id: 'bfi2_02', text: "I don't talk a lot.", scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_03', text: 'I talk to a lot of different people at parties.', scale: BFI2_SCALE },
  { id: 'bfi2_04', text: 'I keep in the background.', scale: BFI2_SCALE, reversed: true },
  // Extraversion - Assertiveness
  { id: 'bfi2_05', text: 'I take charge of situations.', scale: BFI2_SCALE },
  { id: 'bfi2_06', text: 'I have little to say.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_07', text: 'I start conversations.', scale: BFI2_SCALE },
  { id: 'bfi2_08', text: 'I wait for others to lead the way.', scale: BFI2_SCALE, reversed: true },
  // Extraversion - Energy Level
  { id: 'bfi2_09', text: 'I am full of energy.', scale: BFI2_SCALE },
  { id: 'bfi2_10', text: 'I often feel tired and sluggish.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_11', text: 'I am enthusiastic about things.', scale: BFI2_SCALE },
  { id: 'bfi2_12', text: 'I have a low energy level.', scale: BFI2_SCALE, reversed: true },
  // Agreeableness - Compassion
  { id: 'bfi2_13', text: "I sympathize with others' feelings.", scale: BFI2_SCALE },
  { id: 'bfi2_14', text: 'I am not really interested in others.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_15', text: "I feel others' emotions.", scale: BFI2_SCALE },
  { id: 'bfi2_16', text: "I am not interested in other people's problems.", scale: BFI2_SCALE, reversed: true },
  // Agreeableness - Respectfulness
  { id: 'bfi2_17', text: "I respect others' opinions and viewpoints.", scale: BFI2_SCALE },
  { id: 'bfi2_18', text: 'I insult people.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_19', text: 'I treat people with courtesy and respect.', scale: BFI2_SCALE },
  { id: 'bfi2_20', text: 'I can be rude and dismissive toward others.', scale: BFI2_SCALE, reversed: true },
  // Agreeableness - Trust
  { id: 'bfi2_21', text: 'I trust what people say.', scale: BFI2_SCALE },
  { id: 'bfi2_22', text: 'I suspect hidden motives in others.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_23', text: 'I believe that people are basically well-intentioned.', scale: BFI2_SCALE },
  { id: 'bfi2_24', text: 'I distrust people.', scale: BFI2_SCALE, reversed: true },
  // Conscientiousness - Organization
  { id: 'bfi2_25', text: 'I like order and regularity.', scale: BFI2_SCALE },
  { id: 'bfi2_26', text: 'I leave my belongings around.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_27', text: 'I keep things tidy.', scale: BFI2_SCALE },
  { id: 'bfi2_28', text: 'I make a mess of things.', scale: BFI2_SCALE, reversed: true },
  // Conscientiousness - Productiveness
  { id: 'bfi2_29', text: 'I get chores done right away.', scale: BFI2_SCALE },
  { id: 'bfi2_30', text: 'I waste my time.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_31', text: 'I carry out my plans.', scale: BFI2_SCALE },
  { id: 'bfi2_32', text: 'I find it difficult to get down to work.', scale: BFI2_SCALE, reversed: true },
  // Conscientiousness - Responsibility
  { id: 'bfi2_33', text: 'I keep my promises.', scale: BFI2_SCALE },
  { id: 'bfi2_34', text: 'I shirk my duties.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_35', text: 'I am a reliable person.', scale: BFI2_SCALE },
  { id: 'bfi2_36', text: 'I do just enough work to get by.', scale: BFI2_SCALE, reversed: true },
  // Neuroticism - Anxiety
  { id: 'bfi2_37', text: 'I worry about things.', scale: BFI2_SCALE },
  { id: 'bfi2_38', text: 'I am relaxed most of the time.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_39', text: 'I get stressed out easily.', scale: BFI2_SCALE },
  { id: 'bfi2_40', text: 'I seldom feel anxious.', scale: BFI2_SCALE, reversed: true },
  // Neuroticism - Depression
  { id: 'bfi2_41', text: 'I often feel sad.', scale: BFI2_SCALE },
  { id: 'bfi2_42', text: 'I feel comfortable with myself.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_43', text: 'I am filled with doubts about things.', scale: BFI2_SCALE },
  { id: 'bfi2_44', text: 'I feel satisfied with myself most of the time.', scale: BFI2_SCALE, reversed: true },
  // Neuroticism - Emotional Volatility
  { id: 'bfi2_45', text: 'I have frequent mood swings.', scale: BFI2_SCALE },
  { id: 'bfi2_46', text: 'I am not easily bothered by things.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_47', text: 'I get upset easily.', scale: BFI2_SCALE },
  { id: 'bfi2_48', text: 'I keep my emotions under control.', scale: BFI2_SCALE, reversed: true },
  // Openness - Intellectual Curiosity
  { id: 'bfi2_49', text: 'I am curious about many different things.', scale: BFI2_SCALE },
  { id: 'bfi2_50', text: 'I have difficulty understanding abstract ideas.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_51', text: 'I enjoy thinking about complex problems.', scale: BFI2_SCALE },
  { id: 'bfi2_52', text: 'I avoid philosophical discussions.', scale: BFI2_SCALE, reversed: true },
  // Openness - Aesthetic Sensitivity
  { id: 'bfi2_53', text: 'I see beauty in things that others might not notice.', scale: BFI2_SCALE },
  { id: 'bfi2_54', text: 'I am not interested in art or beauty.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_55', text: 'I believe in the importance of art.', scale: BFI2_SCALE },
  { id: 'bfi2_56', text: 'I do not enjoy going to art museums.', scale: BFI2_SCALE, reversed: true },
  // Openness - Creative Imagination
  { id: 'bfi2_57', text: 'I have a vivid imagination.', scale: BFI2_SCALE },
  { id: 'bfi2_58', text: 'I do not have a good imagination.', scale: BFI2_SCALE, reversed: true },
  { id: 'bfi2_59', text: 'I enjoy coming up with new ideas and solutions.', scale: BFI2_SCALE },
  { id: 'bfi2_60', text: 'I have few creative interests.', scale: BFI2_SCALE, reversed: true },
];

const VALUES_SCALE = { min: 1, max: 6, labels: ['Not like me at all', 'Not like me', 'A little like me', 'Somewhat like me', 'Like me', 'Very much like me'] };

const valuesQuestions: QuestionDef[] = [
  { id: 'val_01', text: 'Thinking up new ideas and being creative is important to this person. They like to do things in their own original way.', scale: VALUES_SCALE },
  { id: 'val_02', text: 'It is important to this person to make their own decisions about what they do. They like to be free and not depend on others.', scale: VALUES_SCALE },
  { id: 'val_03', text: 'This person thinks it is important to do lots of different things in life. They always look for new things to try.', scale: VALUES_SCALE },
  { id: 'val_04', text: 'This person likes surprises and is always looking for new things to do. They think it is important to do lots of different things in life.', scale: VALUES_SCALE },
  { id: 'val_05', text: 'Having a good time is important to this person. They like to "spoil" themselves.', scale: VALUES_SCALE },
  { id: 'val_06', text: 'This person seeks every chance to have fun. It is important to them to do things that give them pleasure.', scale: VALUES_SCALE },
  { id: 'val_07', text: 'It is important to this person to show their abilities. They want people to admire what they do.', scale: VALUES_SCALE },
  { id: 'val_08', text: 'Being very successful is important to this person. They hope people will recognize their achievements.', scale: VALUES_SCALE },
  { id: 'val_09', text: 'It is important to this person to be rich. They want to have a lot of money and expensive things.', scale: VALUES_SCALE },
  { id: 'val_10', text: 'It is important to this person that people do what they say. They want to be in charge and tell others what to do.', scale: VALUES_SCALE },
  { id: 'val_11', text: 'It is important to this person to live in secure surroundings. They avoid anything that might endanger their safety.', scale: VALUES_SCALE },
  { id: 'val_12', text: 'It is important to this person that the government ensures their safety against all threats. They want the state to be strong so it can defend its citizens.', scale: VALUES_SCALE },
  { id: 'val_13', text: 'This person believes that people should do what they are told. They think people should follow rules at all times, even when no one is watching.', scale: VALUES_SCALE },
  { id: 'val_14', text: 'It is important to this person always to behave properly. They want to avoid doing anything people would say is wrong.', scale: VALUES_SCALE },
  { id: 'val_15', text: 'Tradition is important to this person. They try to follow the customs handed down by their religion or family.', scale: VALUES_SCALE },
  { id: 'val_16', text: 'It is important to this person to be humble and modest. They try not to draw attention to themselves.', scale: VALUES_SCALE },
  { id: 'val_17', text: 'It is important to this person to help the people around them. They want to care for the well-being of those they know.', scale: VALUES_SCALE },
  { id: 'val_18', text: 'It is very important to this person to be loyal to their friends. They want to devote themselves to people close to them.', scale: VALUES_SCALE },
  { id: 'val_19', text: 'This person strongly believes that people should care for nature. Looking after the environment is important to them.', scale: VALUES_SCALE },
  { id: 'val_20', text: 'It is important to this person to listen to people who are different from them. Even when they disagree with someone, they still want to understand them.', scale: VALUES_SCALE },
  { id: 'val_21', text: "This person believes all the world's people should live in harmony. Promoting peace among all groups in the world is important to them.", scale: VALUES_SCALE },
];

const ECRR_SCALE = { min: 1, max: 7, labels: ['Strongly disagree', 'Disagree', 'Slightly disagree', 'Neutral', 'Slightly agree', 'Agree', 'Strongly agree'] };

const ecrrQuestions: QuestionDef[] = [
  { id: 'ecrr_01', text: "I'm afraid that I will lose my partner's love.", scale: ECRR_SCALE },
  { id: 'ecrr_02', text: 'I often worry that my partner will not want to stay with me.', scale: ECRR_SCALE },
  { id: 'ecrr_03', text: "I often worry that my partner doesn't really love me.", scale: ECRR_SCALE },
  { id: 'ecrr_04', text: "I worry that romantic partners won't care about me as much as I care about them.", scale: ECRR_SCALE },
  { id: 'ecrr_05', text: "I often wish that my partner's feelings for me were as strong as my feelings for him or her.", scale: ECRR_SCALE },
  { id: 'ecrr_06', text: 'I worry a lot about my relationships.', scale: ECRR_SCALE },
  { id: 'ecrr_07', text: 'When my partner is out of sight, I worry that he or she might become interested in someone else.', scale: ECRR_SCALE },
  { id: 'ecrr_08', text: "When I show my feelings for romantic partners, I'm afraid they will not feel the same about me.", scale: ECRR_SCALE },
  { id: 'ecrr_09', text: 'I rarely worry about my partner leaving me.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_10', text: 'My romantic partner makes me doubt myself.', scale: ECRR_SCALE },
  { id: 'ecrr_11', text: 'I do not often worry about being abandoned.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_12', text: "I find that my partner(s) don't want to get as close as I would like.", scale: ECRR_SCALE },
  { id: 'ecrr_13', text: 'Sometimes romantic partners change their feelings about me for no apparent reason.', scale: ECRR_SCALE },
  { id: 'ecrr_14', text: 'My desire to be very close sometimes scares people away.', scale: ECRR_SCALE },
  { id: 'ecrr_15', text: "I'm afraid that once a romantic partner gets to know me, he or she won't like who I really am.", scale: ECRR_SCALE },
  { id: 'ecrr_16', text: "It makes me mad that I don't get the affection and support I need from my partner.", scale: ECRR_SCALE },
  { id: 'ecrr_17', text: "I worry that I won't measure up to other people.", scale: ECRR_SCALE },
  { id: 'ecrr_18', text: "My partner only seems to notice me when I'm angry.", scale: ECRR_SCALE },
  { id: 'ecrr_19', text: 'I prefer not to show a partner how I feel deep down.', scale: ECRR_SCALE },
  { id: 'ecrr_20', text: 'I feel comfortable sharing my private thoughts and feelings with my partner.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_21', text: 'I find it difficult to allow myself to depend on romantic partners.', scale: ECRR_SCALE },
  { id: 'ecrr_22', text: 'I am very comfortable being close to romantic partners.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_23', text: "I don't feel comfortable opening up to romantic partners.", scale: ECRR_SCALE },
  { id: 'ecrr_24', text: 'I prefer not to be too close to romantic partners.', scale: ECRR_SCALE },
  { id: 'ecrr_25', text: 'I get uncomfortable when a romantic partner wants to be very close.', scale: ECRR_SCALE },
  { id: 'ecrr_26', text: 'I find it relatively easy to get close to my partner.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_27', text: "It's not difficult for me to get close to my partner.", scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_28', text: 'I usually discuss my problems and concerns with my partner.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_29', text: 'It helps to turn to my romantic partner in times of need.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_30', text: 'I tell my partner just about everything.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_31', text: 'I talk things over with my partner.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_32', text: 'I am nervous when partners get too close to me.', scale: ECRR_SCALE },
  { id: 'ecrr_33', text: 'I feel comfortable depending on romantic partners.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_34', text: 'I find it easy to depend on romantic partners.', scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_35', text: "It's easy for me to be affectionate with my partner.", scale: ECRR_SCALE, reversed: true },
  { id: 'ecrr_36', text: 'My partner really understands me and my needs.', scale: ECRR_SCALE, reversed: true },
];

const PHQ9_SCALE = { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] };

const phq9Questions: QuestionDef[] = [
  { id: 'phq9_01', text: 'Little interest or pleasure in doing things.', scale: PHQ9_SCALE },
  { id: 'phq9_02', text: 'Feeling down, depressed, or hopeless.', scale: PHQ9_SCALE },
  { id: 'phq9_03', text: 'Trouble falling or staying asleep, or sleeping too much.', scale: PHQ9_SCALE },
  { id: 'phq9_04', text: 'Feeling tired or having little energy.', scale: PHQ9_SCALE },
  { id: 'phq9_05', text: 'Poor appetite or overeating.', scale: PHQ9_SCALE },
  { id: 'phq9_06', text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down.', scale: PHQ9_SCALE },
  { id: 'phq9_07', text: 'Trouble concentrating on things, such as reading the newspaper or watching television.', scale: PHQ9_SCALE },
  { id: 'phq9_08', text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual.', scale: PHQ9_SCALE },
  { id: 'phq9_09', text: 'Thoughts that you would be better off dead, or of hurting yourself in some way.', scale: PHQ9_SCALE, isCrisisItem: true },
];

const GAD7_SCALE = { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] };

const gad7Questions: QuestionDef[] = [
  { id: 'gad7_01', text: 'Feeling nervous, anxious, or on edge.', scale: GAD7_SCALE },
  { id: 'gad7_02', text: 'Not being able to stop or control worrying.', scale: GAD7_SCALE },
  { id: 'gad7_03', text: 'Worrying too much about different things.', scale: GAD7_SCALE },
  { id: 'gad7_04', text: 'Trouble relaxing.', scale: GAD7_SCALE },
  { id: 'gad7_05', text: 'Being so restless that it is hard to sit still.', scale: GAD7_SCALE },
  { id: 'gad7_06', text: 'Becoming easily annoyed or irritable.', scale: GAD7_SCALE },
  { id: 'gad7_07', text: 'Feeling afraid, as if something awful might happen.', scale: GAD7_SCALE },
];

const PSS10_SCALE = { min: 0, max: 4, labels: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] };

const pss10Questions: QuestionDef[] = [
  { id: 'pss10_01', text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', scale: PSS10_SCALE },
  { id: 'pss10_02', text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', scale: PSS10_SCALE },
  { id: 'pss10_03', text: 'In the last month, how often have you felt nervous and stressed?', scale: PSS10_SCALE },
  { id: 'pss10_04', text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', scale: PSS10_SCALE, reversed: true },
  { id: 'pss10_05', text: 'In the last month, how often have you felt that things were going your way?', scale: PSS10_SCALE, reversed: true },
  { id: 'pss10_06', text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', scale: PSS10_SCALE },
  { id: 'pss10_07', text: 'In the last month, how often have you been able to control irritations in your life?', scale: PSS10_SCALE, reversed: true },
  { id: 'pss10_08', text: 'In the last month, how often have you felt that you were on top of things?', scale: PSS10_SCALE, reversed: true },
  { id: 'pss10_09', text: 'In the last month, how often have you been angered because of things that were outside of your control?', scale: PSS10_SCALE },
  { id: 'pss10_10', text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', scale: PSS10_SCALE },
];

const DERS_SCALE = { min: 1, max: 5, labels: ['Almost never', 'Sometimes', 'About half the time', 'Most of the time', 'Almost always'] };

const dersQuestions: QuestionDef[] = [
  { id: 'ders_01', text: "When I'm upset, I feel guilty for feeling that way.", scale: DERS_SCALE },
  { id: 'ders_02', text: "When I'm upset, I become embarrassed for feeling that way.", scale: DERS_SCALE },
  { id: 'ders_03', text: "When I'm upset, I feel like I am weak.", scale: DERS_SCALE },
  { id: 'ders_04', text: "When I'm upset, I have difficulty getting work done.", scale: DERS_SCALE },
  { id: 'ders_05', text: "When I'm upset, I have difficulty focusing on other things.", scale: DERS_SCALE },
  { id: 'ders_06', text: "When I'm upset, I have difficulty concentrating.", scale: DERS_SCALE },
  { id: 'ders_07', text: "When I'm upset, I have difficulty controlling my behaviors.", scale: DERS_SCALE },
  { id: 'ders_08', text: "When I'm upset, I feel out of control.", scale: DERS_SCALE },
  { id: 'ders_09', text: "When I'm upset, I lose control over my behaviors.", scale: DERS_SCALE },
  { id: 'ders_10', text: 'I pay attention to how I feel.', scale: DERS_SCALE, reversed: true },
  { id: 'ders_11', text: 'I care about what I am feeling.', scale: DERS_SCALE, reversed: true },
  { id: 'ders_12', text: "When I'm upset, I acknowledge my emotions.", scale: DERS_SCALE, reversed: true },
  { id: 'ders_13', text: "When I'm upset, I believe that I will remain that way for a long time.", scale: DERS_SCALE },
  { id: 'ders_14', text: "When I'm upset, I believe that there is nothing I can do to make myself feel better.", scale: DERS_SCALE },
  { id: 'ders_15', text: "When I'm upset, I believe that wallowing in it is all I can do.", scale: DERS_SCALE },
  { id: 'ders_16', text: 'I have difficulty making sense out of my feelings.', scale: DERS_SCALE },
  { id: 'ders_17', text: 'I have no idea how I am feeling.', scale: DERS_SCALE },
  { id: 'ders_18', text: 'I am confused about how I feel.', scale: DERS_SCALE },
];

const ASRS_SCALE = { min: 0, max: 4, labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'] };

const asrsQuestions: QuestionDef[] = [
  { id: 'asrs_01', text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?', scale: ASRS_SCALE },
  { id: 'asrs_02', text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?', scale: ASRS_SCALE },
  { id: 'asrs_03', text: 'How often do you have problems remembering appointments or obligations?', scale: ASRS_SCALE },
  { id: 'asrs_04', text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?', scale: ASRS_SCALE },
  { id: 'asrs_05', text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?', scale: ASRS_SCALE },
  { id: 'asrs_06', text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?', scale: ASRS_SCALE },
  { id: 'asrs_07', text: 'How often do you make careless mistakes when you have to work on a boring or difficult project?', scale: ASRS_SCALE },
  { id: 'asrs_08', text: 'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?', scale: ASRS_SCALE },
  { id: 'asrs_09', text: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?', scale: ASRS_SCALE },
  { id: 'asrs_10', text: 'How often do you misplace or have difficulty finding things at home or at work?', scale: ASRS_SCALE },
  { id: 'asrs_11', text: 'How often are you distracted by activity or noise around you?', scale: ASRS_SCALE },
  { id: 'asrs_12', text: 'How often do you leave your seat in meetings or other situations in which you are expected to remain seated?', scale: ASRS_SCALE },
  { id: 'asrs_13', text: 'How often do you feel restless or fidgety?', scale: ASRS_SCALE },
  { id: 'asrs_14', text: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?', scale: ASRS_SCALE },
  { id: 'asrs_15', text: 'How often do you find yourself talking too much when you are in social situations?', scale: ASRS_SCALE },
  { id: 'asrs_16', text: "When you're in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?", scale: ASRS_SCALE },
  { id: 'asrs_17', text: 'How often do you have difficulty waiting your turn in situations when turn taking is required?', scale: ASRS_SCALE },
  { id: 'asrs_18', text: 'How often do you interrupt others when they are busy?', scale: ASRS_SCALE },
];

const AQ10_SCALE = { min: 0, max: 3, labels: ['Definitely agree', 'Slightly agree', 'Slightly disagree', 'Definitely disagree'] };

const aq10Questions: QuestionDef[] = [
  { id: 'aq10_01', text: 'I often notice small sounds when others do not.', scale: AQ10_SCALE },
  { id: 'aq10_02', text: 'I usually concentrate more on the whole picture, rather than the small details.', scale: AQ10_SCALE },
  { id: 'aq10_03', text: 'I find it easy to do more than one thing at once.', scale: AQ10_SCALE },
  { id: 'aq10_04', text: 'If there is an interruption, I can switch back to what I was doing very quickly.', scale: AQ10_SCALE },
  { id: 'aq10_05', text: 'I find it easy to read between the lines when someone is talking to me.', scale: AQ10_SCALE },
  { id: 'aq10_06', text: 'I know how to tell if someone listening to me is getting bored.', scale: AQ10_SCALE },
  { id: 'aq10_07', text: "When I'm reading a story, I find it difficult to work out the characters' intentions.", scale: AQ10_SCALE },
  { id: 'aq10_08', text: 'I like to collect information about categories of things (e.g., types of car, types of bird, types of train, types of plant, etc.).', scale: AQ10_SCALE },
  { id: 'aq10_09', text: "I find it easy to work out what someone is thinking or feeling just by looking at their face.", scale: AQ10_SCALE },
  { id: 'aq10_10', text: "I find it difficult to work out people's intentions.", scale: AQ10_SCALE },
];

const ACE_SCALE = { min: 0, max: 1, labels: ['No', 'Yes'] };

const aceQuestions: QuestionDef[] = [
  { id: 'ace_01', text: 'Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you? Or act in a way that made you afraid that you might be physically hurt?', scale: ACE_SCALE, hasContentWarning: true, contentWarning: 'This question asks about emotional abuse.' },
  { id: 'ace_02', text: 'Did a parent or other adult in the household often or very often push, grab, slap, or throw something at you? Or ever hit you so hard that you had marks or were injured?', scale: ACE_SCALE, hasContentWarning: true, contentWarning: 'This question asks about physical abuse.' },
  { id: 'ace_03', text: 'Did an adult or person at least 5 years older than you ever touch or fondle you or have you touch their body in a sexual way? Or attempt or actually have oral, anal, or vaginal intercourse with you?', scale: ACE_SCALE, hasContentWarning: true, contentWarning: 'This question asks about sexual abuse.' },
  { id: 'ace_04', text: "Did you often or very often feel that no one in your family loved you or thought you were important or special? Or your family didn't look out for each other, feel close to each other, or support each other?", scale: ACE_SCALE, hasContentWarning: true, contentWarning: 'This question asks about emotional neglect.' },
  { id: 'ace_05', text: "Did you often or very often feel that you didn't have enough to eat, had to wear dirty clothes, and had no one to protect you? Or your parents were too drunk or high to take care of you or take you to the doctor if you needed it?", scale: ACE_SCALE, hasContentWarning: true, contentWarning: 'This question asks about physical neglect.' },
  { id: 'ace_06', text: 'Were your parents ever separated or divorced?', scale: ACE_SCALE },
  { id: 'ace_07', text: 'Was your mother or stepmother often or very often pushed, grabbed, slapped, or had something thrown at her? Or sometimes, often, or very often kicked, bitten, hit with a fist, or hit with something hard?', scale: ACE_SCALE, hasContentWarning: true, contentWarning: 'This question asks about domestic violence.' },
  { id: 'ace_08', text: 'Did you live with anyone who was a problem drinker or alcoholic, or who used street drugs?', scale: ACE_SCALE },
  { id: 'ace_09', text: 'Was a household member depressed or mentally ill, or did a household member attempt suicide?', scale: ACE_SCALE },
  { id: 'ace_10', text: 'Did a household member go to prison?', scale: ACE_SCALE },
];

const PCPTSD5_SCALE = { min: 0, max: 1, labels: ['No', 'Yes'] };

const pcptsd5Questions: QuestionDef[] = [
  { id: 'pcptsd5_01', text: 'Had nightmares about the event(s) or thought about the event(s) when you did not want to?', scale: PCPTSD5_SCALE },
  { id: 'pcptsd5_02', text: 'Tried hard not to think about the event(s) or went out of your way to avoid situations that reminded you of the event(s)?', scale: PCPTSD5_SCALE },
  { id: 'pcptsd5_03', text: 'Been constantly on guard, watchful, or easily startled?', scale: PCPTSD5_SCALE },
  { id: 'pcptsd5_04', text: 'Felt numb or detached from people, activities, or your surroundings?', scale: PCPTSD5_SCALE },
  { id: 'pcptsd5_05', text: 'Felt guilty or unable to stop blaming yourself or others for the event(s) or any problems the event(s) may have caused?', scale: PCPTSD5_SCALE },
];

// ---------------------------------------------------------------------------
// Section definitions
// ---------------------------------------------------------------------------

const SECTIONS: AssessmentSection[] = [
  {
    id: 'personality',
    title: 'Personality',
    description: 'Explore your core personality traits across five major dimensions: how you engage with the world, relate to others, approach work, handle emotions, and embrace new experiences.',
    estimatedMinutes: 12,
    instruments: [
      { id: 'BFI2', name: 'Big Five Inventory-2', preamble: 'I see myself as someone who...', questions: bfi2Questions },
    ],
  },
  {
    id: 'values',
    title: 'Values & Motivations',
    description: 'Discover what drives you at the deepest level. This section maps your core motivational values -- the principles that guide your decisions and define what matters most to you.',
    estimatedMinutes: 5,
    instruments: [
      { id: 'PVQ', name: 'Portrait Values Questionnaire', preamble: 'Here we briefly describe different people. Please read each description and think about how much each person is or is not like you.', questions: valuesQuestions },
    ],
  },
  {
    id: 'attachment',
    title: 'Attachment & Relationships',
    description: 'Understand your relationship patterns. This section explores how you connect, trust, and relate to the people closest to you -- shaped by a lifetime of relational experiences.',
    estimatedMinutes: 8,
    instruments: [
      { id: 'ECR_R', name: 'Experiences in Close Relationships', preamble: 'Please indicate the extent to which you agree or disagree with each of the following statements about romantic relationships.', questions: ecrrQuestions },
    ],
  },
  {
    id: 'emotional-wellbeing',
    title: 'Emotional Wellbeing',
    description: 'A clinical-grade check on your current emotional state. These are the same screening tools your doctor would use to assess depression and anxiety.',
    estimatedMinutes: 4,
    instruments: [
      { id: 'PHQ9', name: 'Depression Screen (PHQ-9)', preamble: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?', questions: phq9Questions },
      { id: 'GAD7', name: 'Anxiety Screen (GAD-7)', preamble: 'Over the last 2 weeks, how often have you been bothered by the following problems?', questions: gad7Questions },
    ],
  },
  {
    id: 'stress-regulation',
    title: 'Stress & Emotion Regulation',
    description: 'How you experience and manage stress, and the strategies you use (or struggle to find) when emotions run high. These patterns shape everything from daily mood to long-term wellbeing.',
    estimatedMinutes: 7,
    instruments: [
      { id: 'PSS10', name: 'Perceived Stress Scale', preamble: 'The following questions ask about your feelings and thoughts during the last month.', questions: pss10Questions },
      { id: 'DERS_SF', name: 'Emotion Regulation (DERS-SF)', preamble: 'Please indicate how often the following statements apply to you.', questions: dersQuestions },
    ],
  },
  {
    id: 'neurodivergence',
    title: 'Neurodivergence Screening',
    description: 'Evidence-based screens for ADHD and autism spectrum traits. These are not diagnostic, but they can highlight patterns worth exploring with a specialist.',
    estimatedMinutes: 6,
    instruments: [
      { id: 'ASRS', name: 'ADHD Screen (ASRS)', preamble: 'Over the past 6 months, how often have you experienced the following?', questions: asrsQuestions },
      { id: 'AQ10', name: 'Autism Spectrum (AQ-10)', preamble: 'Please read each statement and rate how strongly you agree or disagree.', questions: aq10Questions },
    ],
  },
  {
    id: 'trauma',
    title: 'Trauma & Life Experiences',
    description: 'A compassionate look at formative experiences. This section is optional but powerful -- understanding your history can illuminate patterns across every other domain.',
    estimatedMinutes: 4,
    instruments: [
      {
        id: 'ACE',
        name: 'Adverse Childhood Experiences',
        preamble: 'While you were growing up, during your first 18 years of life, did any of the following apply to you? You may skip any question you are not comfortable answering.',
        questions: aceQuestions,
      },
      {
        id: 'PC_PTSD5',
        name: 'PTSD Screen (PC-PTSD-5)',
        preamble: 'Sometimes things happen to people that are unusually frightening, horrible, or traumatic. In the past month, have you...',
        questions: pcptsd5Questions,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten all questions across all sections into a single ordered list. */
function getAllQuestions(): { question: QuestionDef; sectionIndex: number; instrumentId: string; instrumentName: string; localIndex: number; localTotal: number; preamble?: string }[] {
  const all: { question: QuestionDef; sectionIndex: number; instrumentId: string; instrumentName: string; localIndex: number; localTotal: number; preamble?: string }[] = [];
  SECTIONS.forEach((section, sIdx) => {
    section.instruments.forEach((inst) => {
      inst.questions.forEach((q, qIdx) => {
        all.push({
          question: q,
          sectionIndex: sIdx,
          instrumentId: inst.id,
          instrumentName: inst.name,
          localIndex: qIdx,
          localTotal: inst.questions.length,
          preamble: inst.preamble,
        });
      });
    });
  });
  return all;
}

const ALL_QUESTIONS = getAllQuestions();
const TOTAL_QUESTIONS = ALL_QUESTIONS.length;

function getSectionQuestionRange(sectionIndex: number): { start: number; end: number } {
  let start = 0;
  for (let i = 0; i < sectionIndex; i++) {
    SECTIONS[i].instruments.forEach((inst) => {
      start += inst.questions.length;
    });
  }
  let count = 0;
  SECTIONS[sectionIndex].instruments.forEach((inst) => {
    count += inst.questions.length;
  });
  return { start, end: start + count };
}

function getSectionTotalQuestions(sectionIndex: number): number {
  const r = getSectionQuestionRange(sectionIndex);
  return r.end - r.start;
}

function getSectionAnsweredCount(sectionIndex: number, answers: Record<string, number>): number {
  const r = getSectionQuestionRange(sectionIndex);
  let count = 0;
  for (let i = r.start; i < r.end; i++) {
    if (ALL_QUESTIONS[i].question.id in answers) count++;
  }
  return count;
}

function getTotalEstimatedMinutes(): number {
  return SECTIONS.reduce((acc, s) => acc + s.estimatedMinutes, 0);
}

function getEstimatedMinutesRemaining(answered: number): number {
  const fraction = answered / TOTAL_QUESTIONS;
  const totalMin = getTotalEstimatedMinutes();
  return Math.max(1, Math.round(totalMin * (1 - fraction)));
}

// ---------------------------------------------------------------------------
// Screen phases
// ---------------------------------------------------------------------------

type Phase = 'intro' | 'section-transition' | 'question' | 'completion';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const pageVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const chipVariants = {
  idle: { scale: 1 },
  tap: { scale: 0.95 },
  selected: { scale: 1.05, transition: { type: 'spring' as const, stiffness: 400, damping: 17 } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AssessPage() {
  // -- Store --
  const store = useAssessmentStore();
  const {
    answers,
    setAnswer,
    startAssessment,
    completeAssessment,
    setCrisisDetected,
    crisisDetected,
    startedAt,
    completedAt,
  } = store;

  // -- Local state --
  const [phase, setPhase] = useState<Phase>('intro');
  const [globalIndex, setGlobalIndex] = useState(0);
  const [showSaved, setShowSaved] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [contentWarningAcknowledged, setContentWarningAcknowledged] = useState<Record<string, boolean>>({});
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Intro form state
  const [ageRange, setAgeRange] = useState(store.ageRange || '');
  const [gender, setGender] = useState(store.gender || '');
  const [relationship, setRelationship] = useState<string>(
    store.inRelationship === null ? '' : store.inRelationship ? 'yes' : 'no'
  );

  // Refs
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // -- Derived --
  const currentEntry = ALL_QUESTIONS[globalIndex] || ALL_QUESTIONS[0];
  const currentSection = SECTIONS[currentEntry?.sectionIndex ?? 0];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = TOTAL_QUESTIONS > 0 ? Math.round((answeredCount / TOTAL_QUESTIONS) * 100) : 0;
  const currentAnswer = answers[currentEntry?.question.id];

  // Compute question number within current section
  const sectionRange = getSectionQuestionRange(currentEntry.sectionIndex);
  const questionInSection = globalIndex - sectionRange.start + 1;
  const totalInSection = getSectionTotalQuestions(currentEntry.sectionIndex);

  // -- Resume existing assessment --
  useEffect(() => {
    if (startedAt && !completedAt) {
      // Resume: find first unanswered question
      const firstUnanswered = ALL_QUESTIONS.findIndex((e) => !(e.question.id in answers));
      if (firstUnanswered >= 0) {
        setGlobalIndex(firstUnanswered);
        setPhase('question');
      } else if (answeredCount >= TOTAL_QUESTIONS) {
        setPhase('completion');
      }
    }
    // Check if crisis was already detected
    if (crisisDetected) {
      setShowCrisisBanner(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- Close dropdown when clicking outside --
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSectionDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // -- Flash "Saved" indicator --
  const flashSaved = useCallback(() => {
    setShowSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setShowSaved(false), 1500);
  }, []);

  // -- Handle answer selection --
  const handleAnswer = useCallback(
    (value: number) => {
      if (transitioning) return;
      const q = currentEntry.question;
      setAnswer(q.id, value);
      flashSaved();

      // Crisis detection
      if (q.isCrisisItem && value >= 1) {
        setCrisisDetected(true);
        setShowCrisisBanner(true);
      }

      // Auto-advance
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        goToNext();
      }, 420);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalIndex, transitioning, currentEntry],
  );

  // -- Navigation --
  const goToNext = useCallback(() => {
    if (globalIndex < TOTAL_QUESTIONS - 1) {
      const nextIndex = globalIndex + 1;
      const nextEntry = ALL_QUESTIONS[nextIndex];
      setDirection(1);

      // Check if we're crossing a section boundary
      if (nextEntry.sectionIndex !== currentEntry.sectionIndex) {
        setTransitioning(true);
        setPhase('section-transition');
        setGlobalIndex(nextIndex);
        return;
      }

      setGlobalIndex(nextIndex);
    } else {
      // All questions done
      completeAssessment();
      setPhase('completion');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalIndex, currentEntry]);

  const goToPrevious = useCallback(() => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (globalIndex > 0) {
      setDirection(-1);
      const prevIndex = globalIndex - 1;
      const prevEntry = ALL_QUESTIONS[prevIndex];

      if (prevEntry.sectionIndex !== currentEntry.sectionIndex && phase === 'question') {
        // Just jump back without section transition
      }
      setGlobalIndex(prevIndex);
      if (phase !== 'question') setPhase('question');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalIndex, currentEntry, phase]);

  const jumpToSection = useCallback(
    (sectionIndex: number) => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      const range = getSectionQuestionRange(sectionIndex);
      setDirection(range.start > globalIndex ? 1 : -1);
      setGlobalIndex(range.start);
      setSectionDropdownOpen(false);
      setPhase('question');
    },
    [globalIndex],
  );

  const skipQuestion = useCallback(() => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    goToNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToNext]);

  // -- Keyboard navigation --
  useEffect(() => {
    if (phase !== 'question') return;

    function handleKeyDown(e: KeyboardEvent) {
      const q = ALL_QUESTIONS[globalIndex]?.question;
      if (!q) return;

      const { min, max } = q.scale;
      const range = max - min + 1;

      // Number keys 1-9 for answering
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= range) {
        e.preventDefault();
        handleAnswer(min + num - 1);
        return;
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentAnswer !== undefined) goToNext();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevious();
      }

      // Enter to advance if answered
      if (e.key === 'Enter' && currentAnswer !== undefined) {
        e.preventDefault();
        goToNext();
      }

      // S key to skip
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        skipQuestion();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, globalIndex, currentAnswer, handleAnswer, goToNext, goToPrevious, skipQuestion]);

  // -- Start assessment --
  const handleStart = () => {
    store.setUserInfo({
      ageRange: ageRange || undefined,
      gender: gender || undefined,
      inRelationship: relationship === 'yes' ? true : relationship === 'no' ? false : undefined,
    });
    startAssessment();
    setPhase('section-transition');
    setGlobalIndex(0);
  };

  // -- Continue from section transition --
  const handleContinueFromTransition = () => {
    setTransitioning(false);
    setPhase('question');
  };

  // Check all answered for completion
  const allAnswered = answeredCount >= TOTAL_QUESTIONS;
  useEffect(() => {
    if (allAnswered && phase === 'question') {
      completeAssessment();
      setPhase('completion');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderProgressBar = () => (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Progress track */}
      <div className="progress-bar h-1">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      {/* Header bar */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-navy-100">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
          {/* Left: back + section info */}
          <div className="flex items-center gap-3">
            {phase === 'question' && globalIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-navy-50 transition-colors text-navy-500"
                aria-label="Previous question"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Section dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setSectionDropdownOpen(!sectionDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
              >
                <span className="hidden sm:inline">{currentSection?.title}</span>
                <span className="sm:hidden text-xs">{currentSection?.title.split(' ')[0]}</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${sectionDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {sectionDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-navy-100 py-2 z-50"
                  >
                    {SECTIONS.map((section, idx) => {
                      const answered = getSectionAnsweredCount(idx, answers);
                      const total = getSectionTotalQuestions(idx);
                      const isComplete = answered >= total;
                      const isCurrent = idx === currentEntry.sectionIndex;
                      return (
                        <button
                          key={section.id}
                          onClick={() => jumpToSection(idx)}
                          className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-navy-50 transition-colors ${isCurrent ? 'bg-amber-50' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isComplete ? 'bg-sage-500 text-white' : isCurrent ? 'bg-amber-500 text-white' : 'bg-navy-100 text-navy-500'}`}>
                              {isComplete ? (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-navy-800">{section.title}</div>
                              <div className="text-xs text-navy-400">{answered}/{total} answered</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center: question counter */}
          {phase === 'question' && (
            <div className="text-xs text-navy-400 font-medium tabular-nums">
              <span className="hidden sm:inline">Question </span>{questionInSection} of {totalInSection}
            </div>
          )}

          {/* Right: progress + saved + time */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-1 text-sage-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-medium">Saved</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-xs text-navy-400 tabular-nums">
              {progressPercent}%
            </div>
            <div className="hidden sm:block text-xs text-navy-300">
              ~{getEstimatedMinutesRemaining(answeredCount)} min left
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // CRISIS BANNER
  // ---------------------------------------------------------------------------

  const renderCrisisBanner = () => (
    <AnimatePresence>
      {showCrisisBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="crisis-banner fixed top-[calc(4.5rem)] left-0 right-0 z-40 bg-coral-600 text-white px-4 py-3"
        >
          <div className="mx-auto max-w-3xl flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">You are not alone. Help is available right now.</p>
              <p className="text-sm mt-1 text-coral-100">
                Call or text <a href="tel:988" className="font-bold underline">988</a> (Suicide &amp; Crisis Lifeline) or text <span className="font-bold">HOME</span> to <a href="sms:741741" className="font-bold underline">741741</a> (Crisis Text Line).
              </p>
            </div>
            <button
              onClick={() => setShowCrisisBanner(false)}
              className="shrink-0 p-1 rounded hover:bg-coral-500 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ---------------------------------------------------------------------------
  // INTRO SCREEN
  // ---------------------------------------------------------------------------

  const renderIntro = () => (
    <motion.div
      key="intro"
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="min-h-screen flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="inline-block mb-10">
          <span className="font-[family-name:var(--font-display)] text-xl text-navy-900">
            Deep <span className="gradient-text">Personality</span>
          </span>
        </Link>

        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-navy-900 leading-tight">
          Your comprehensive<br />
          <span className="gradient-text">self-assessment</span>
        </h1>

        <p className="mt-4 text-navy-600 leading-relaxed">
          {TOTAL_QUESTIONS} questions across {SECTIONS.length} sections, covering personality, values, attachment, emotional wellbeing, neurodivergence, and life experiences. Takes about {getTotalEstimatedMinutes()} minutes.
        </p>

        {/* What to expect */}
        <div className="mt-8 space-y-3">
          {[
            { icon: 'clock', text: 'Your progress auto-saves after every answer' },
            { icon: 'shield', text: 'Clinically-validated instruments, scored exactly as published' },
            { icon: 'lock', text: 'Your responses are private and encrypted' },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-3 text-sm text-navy-600">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                {item.icon === 'clock' && (
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {item.icon === 'shield' && (
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {item.icon === 'lock' && (
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              {item.text}
            </div>
          ))}
        </div>

        {/* User info collection */}
        <div className="mt-10 space-y-4 border-t border-navy-100 pt-8">
          <p className="text-sm font-medium text-navy-700">A few quick details <span className="text-navy-400 font-normal">(helps us contextualize your results)</span></p>

          {/* Age range */}
          <div>
            <label htmlFor="age-range" className="block text-sm text-navy-600 mb-1.5">Age range</label>
            <select
              id="age-range"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors appearance-none"
            >
              <option value="">Select...</option>
              <option value="18_24">18-24</option>
              <option value="25_34">25-34</option>
              <option value="35_44">35-44</option>
              <option value="45_54">45-54</option>
              <option value="55_64">55-64</option>
              <option value="65_plus">65+</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm text-navy-600 mb-1.5">Gender <span className="text-navy-300">(optional)</span></label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors appearance-none"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Relationship status */}
          <div>
            <label htmlFor="relationship" className="block text-sm text-navy-600 mb-1.5">Currently in a relationship?</label>
            <select
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors appearance-none"
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="mt-8 w-full rounded-full bg-navy-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-navy-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          Begin Assessment
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className="mt-4 text-center text-xs text-navy-400">
          Not a diagnosis. Results are screening-level and intended for personal insight.
        </p>
      </div>
    </motion.div>
  );

  // ---------------------------------------------------------------------------
  // SECTION TRANSITION
  // ---------------------------------------------------------------------------

  const renderSectionTransition = () => {
    const section = SECTIONS[currentEntry.sectionIndex];
    const sectionIdx = currentEntry.sectionIndex;
    const sectionAnswered = getSectionAnsweredCount(sectionIdx, answers);
    const sectionTotal = getSectionTotalQuestions(sectionIdx);

    return (
      <motion.div
        key={`section-${section.id}`}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className="min-h-screen flex items-center justify-center px-4 py-24"
      >
        <div className="w-full max-w-lg text-center">
          {/* Section number badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 mb-6"
          >
            Section {sectionIdx + 1} of {SECTIONS.length}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-navy-900"
          >
            {section.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4 text-navy-600 leading-relaxed max-w-md mx-auto"
          >
            {section.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-navy-500"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ~{section.estimatedMinutes} min
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {sectionTotal} questions{sectionAnswered > 0 && ` (${sectionAnswered} answered)`}
            </div>
          </motion.div>

          {/* Instruments list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {section.instruments.map((inst) => (
              <span
                key={inst.id}
                className="inline-flex items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600"
              >
                {inst.name}
              </span>
            ))}
          </motion.div>

          {/* Content warning for trauma section */}
          {section.id === 'trauma' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-left"
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">Content Advisory</p>
                  <p className="text-sm text-amber-700 mt-1">
                    This section asks about potentially difficult childhood and life experiences, including abuse, neglect, and trauma. Take your time and skip any question you are not comfortable answering. Your responses are confidential.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleContinueFromTransition}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-navy-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-navy-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {sectionAnswered > 0 ? 'Continue' : 'Start Section'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // QUESTION DISPLAY
  // ---------------------------------------------------------------------------

  const renderQuestion = () => {
    const entry = currentEntry;
    const q = entry.question;
    const { min, max, labels } = q.scale;
    const scaleValues: number[] = [];
    for (let i = min; i <= max; i++) scaleValues.push(i);
    const selected = answers[q.id];

    // Determine if this is a new instrument (show preamble)
    const showPreamble = entry.localIndex === 0 && entry.preamble;

    // Content warning for individual question
    const needsWarningAck = q.hasContentWarning && !contentWarningAcknowledged[q.id];

    return (
      <motion.div
        key={`q-${q.id}`}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        custom={direction}
        className="min-h-screen flex flex-col pt-24 pb-8 px-4"
      >
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          {/* Instrument preamble */}
          <AnimatePresence mode="wait">
            {showPreamble && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 text-center"
              >
                <span className="inline-flex items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-500 mb-3">
                  {entry.instrumentName}
                </span>
                <p className="text-sm text-navy-500 italic max-w-md mx-auto">{entry.preamble}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content warning overlay */}
          {needsWarningAck ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="assessment-card p-8 max-w-md w-full text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-navy-800 mb-2">Content Notice</p>
              <p className="text-sm text-navy-600 mb-6">{q.contentWarning}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={skipQuestion}
                  className="rounded-full border border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-50 transition-colors"
                >
                  Skip this question
                </button>
                <button
                  onClick={() => setContentWarningAcknowledged((prev) => ({ ...prev, [q.id]: true }))}
                  className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-800 transition-colors"
                >
                  I understand, continue
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Question text */}
              <motion.div
                key={`text-${q.id}`}
                initial={{ opacity: 0, y: direction > 0 ? 20 : -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center mb-10 sm:mb-12"
              >
                {!showPreamble && entry.localIndex > 0 && (
                  <span className="inline-flex items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-400 mb-4">
                    {entry.instrumentName}
                  </span>
                )}
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.7rem] text-navy-900 leading-relaxed max-w-xl mx-auto">
                  {q.text}
                </h2>
              </motion.div>

              {/* Likert scale chips */}
              <motion.div
                key={`scale-${q.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full max-w-md"
              >
                {/* Scale labels (first and last) */}
                {labels.length >= 2 && (
                  <div className="flex justify-between mb-2 px-1">
                    <span className="text-xs text-navy-400 max-w-[40%]">{labels[0]}</span>
                    <span className="text-xs text-navy-400 max-w-[40%] text-right">{labels[labels.length - 1]}</span>
                  </div>
                )}

                {/* Chips */}
                <div className={`flex gap-2 ${scaleValues.length <= 2 ? 'justify-center' : 'justify-between'}`}>
                  {scaleValues.map((val, idx) => {
                    const isSelected = selected === val;
                    const label = labels[idx] || String(val);
                    const isBinary = max - min <= 1;

                    return (
                      <motion.button
                        key={val}
                        variants={chipVariants}
                        initial="idle"
                        animate={isSelected ? 'selected' : 'idle'}
                        whileTap="tap"
                        onClick={() => handleAnswer(val)}
                        className={`likert-chip flex-1 ${isBinary ? 'max-w-[10rem]' : ''} ${isSelected ? 'selected' : ''}`}
                        aria-label={label}
                        aria-pressed={isSelected}
                      >
                        <span className="flex flex-col items-center gap-0.5">
                          {!isBinary && <span className="text-base font-semibold">{val}</span>}
                          {(isBinary || scaleValues.length <= 5) && (
                            <span className={`text-[0.65rem] leading-tight ${isSelected ? 'text-white/90' : 'text-navy-400'}`}>
                              {label}
                            </span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Middle labels for wider scales */}
                {scaleValues.length > 5 && labels.length > 2 && (
                  <div className="flex justify-center mt-2">
                    <span className="text-xs text-navy-300">{labels[Math.floor(labels.length / 2)]}</span>
                  </div>
                )}
              </motion.div>

              {/* Skip + keyboard hints */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-10 flex flex-col items-center gap-3"
              >
                <button
                  onClick={skipQuestion}
                  className="text-sm text-navy-400 hover:text-navy-600 transition-colors"
                >
                  Skip this question
                </button>

                {/* Keyboard shortcuts hint (desktop only) */}
                <div className="hidden sm:flex items-center gap-4 text-[0.65rem] text-navy-300">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-navy-200 bg-navy-50 font-mono text-navy-400">1</kbd>
                    -
                    <kbd className="px-1.5 py-0.5 rounded border border-navy-200 bg-navy-50 font-mono text-navy-400">{max - min + 1}</kbd>
                    to answer
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-navy-200 bg-navy-50 font-mono text-navy-400">S</kbd>
                    skip
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-navy-200 bg-navy-50 font-mono text-navy-400">&larr;</kbd>
                    <kbd className="px-1.5 py-0.5 rounded border border-navy-200 bg-navy-50 font-mono text-navy-400">&rarr;</kbd>
                    navigate
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // COMPLETION SCREEN
  // ---------------------------------------------------------------------------

  const renderCompletion = () => {
    const unansweredCount = TOTAL_QUESTIONS - answeredCount;

    return (
      <motion.div
        key="completion"
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className="min-h-screen flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-lg text-center">
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-coral-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-200"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-navy-900"
          >
            Assessment Complete
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-navy-600 leading-relaxed"
          >
            {unansweredCount === 0
              ? `You answered all ${TOTAL_QUESTIONS} questions. Your responses have been saved and are ready for scoring.`
              : `You answered ${answeredCount} of ${TOTAL_QUESTIONS} questions. ${unansweredCount} were skipped.`}
          </motion.p>

          {/* Section summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 space-y-2"
          >
            {SECTIONS.map((section, idx) => {
              const answered = getSectionAnsweredCount(idx, answers);
              const total = getSectionTotalQuestions(idx);
              const pct = Math.round((answered / total) * 100);
              return (
                <div key={section.id} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white border border-navy-100">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${pct === 100 ? 'bg-sage-500' : pct > 0 ? 'bg-amber-500' : 'bg-navy-200'}`}>
                    {pct === 100 ? (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-[0.5rem] font-bold text-white">{pct}%</span>
                    )}
                  </div>
                  <span className="text-sm text-navy-700 flex-1 text-left">{section.title}</span>
                  <span className="text-xs text-navy-400 tabular-nums">{answered}/{total}</span>
                </div>
              );
            })}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 space-y-3"
          >
            <Link
              href="/results"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-navy-800 hover:shadow-xl hover:-translate-y-0.5"
            >
              View My Results
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {unansweredCount > 0 && (
              <button
                onClick={() => {
                  const firstUnanswered = ALL_QUESTIONS.findIndex((e) => !(e.question.id in answers));
                  if (firstUnanswered >= 0) {
                    setGlobalIndex(firstUnanswered);
                    setPhase('question');
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-navy-200 px-8 py-4 text-base font-medium text-navy-700 hover:bg-navy-50 transition-colors"
              >
                Answer Skipped Questions ({unansweredCount})
              </button>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-xs text-navy-400"
          >
            Your assessment data is encrypted and stored securely on your device.
          </motion.p>
        </div>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#fafbfc] relative">
      {/* Progress bar - visible during questions and section transitions */}
      {(phase === 'question' || phase === 'section-transition') && startedAt && renderProgressBar()}

      {/* Crisis banner */}
      {renderCrisisBanner()}

      {/* Main content with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && renderIntro()}
        {phase === 'section-transition' && renderSectionTransition()}
        {phase === 'question' && renderQuestion()}
        {phase === 'completion' && renderCompletion()}
      </AnimatePresence>
    </div>
  );
}
